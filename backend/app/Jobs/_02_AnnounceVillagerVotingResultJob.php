<?php

namespace App\Jobs;

use App\Events\GameEvent;
use App\Http\Controllers\VoteController;
use App\Models\Game;
use App\Models\Participant;
use App\Models\State;
use App\Models\Votation;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class _02_AnnounceVillagerVotingResultJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $gameId;

    public bool $isFirstDay;

    /**
     * Create a new job instance.
     */
    public function __construct(int $gameId, bool $isFirstDay)
    {
        $this->gameId = $gameId;
        $this->isFirstDay = $isFirstDay;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {

        // Primero carga la partida
        $game = Game::find($this->gameId);

        if (! $game) {
            // TODO: Lanzar error (la ia sugiere usar un logger)
            return;
        }

        // $latestDay = $game->votations()->latest()->day_number; // busco el ultimo dia en las votaciones de la partida porque teoricamente sería el ultimo añadido por lo que es el dia actual
        $latestVotation = $game->votations()->latest('day_number')->first();

        $latestDay = $latestVotation?->day_number ?? 0;

        // Segundo obtener resultado de la votación llamando al controlador
        $response = VoteController::resolveVoting($this->gameId, 'day', $latestDay); // si da fallos, aqui puede ser un sitio

        $victim = null;
        $messageText = '';
        $winStatus = ['finished' => false, 'winners' => null];

        // Aqui se cierra la votación en bbdd
        $votation = Votation::where('game_id', $this->gameId) // en esta consulta podría recoger el ultimo directamente
            ->where('is_day', true)
            ->where('day_number', $latestDay)
            ->first();

        if ($votation) {
            $votation->update(['is_closed' => true]);
        } // cierro la votación

        if (isset($response['success']) && $response['success']) { // compruebo que la respuesta haya sido success
            $result = $response['data'];
            $victimId = $result['resolved_candidate_id']; // recojo el id del participante escogido

            if ($victimId != null && ! $this->isFirstDay) { // si hay procede, posible sitio de fallo
                $victim = Participant::find($victimId);

                if ($victim) { // controlo que haya recibido algo de bbdd
                    // marcar como muerto a traves del sistema de estados
                    $deadState = State::where('name', 'DEAD')->first();

                    if ($deadState) { // controlo el hecho de que exista el estado muerto
                        $victim->states()->syncWithoutDetaching([$deadState->id]); // este controla que no se desasigne nada

                        // $victim->states()->attach($deadState->id); //si da error el anterior probar con este otro

                    } // else sería para añadir el estado muerto ?
                    // Determina el nombre del rol para el mensaje (la revelación de quien era)
                    $roleName = 'Desconocido'; // por defecto uso este en caso de que haya algun fallo
                    if ($victim->character) {
                        $roleName = $victim->character->name;
                    } elseif ($victim->character_id === 2) { // en caso de que fallo lo anterior lo controlo a lo bruto
                        $roleName = 'Lobo';
                    } else {
                        $roleName = 'Aldeano'; // por defecto todos son aldeanos
                    }

                    $messageText = $this->messageGenerator($victim->nickname, $roleName, true);
                } else {

                    // Error o sin votos
                    $messageText = 'RESULTADO: El silencio reina. No se han emitido votos suficientes.';
                }
            } elseif ($this->isFirstDay) {
                // En caso de que sea el primer dia se comprueba si hay elegido de ser el alcalde
                if ($victimId != null) { // comrpobcion de que haya habido almenos un voto a una persona
                    $victim = Participant::find($victimId);
                    if ($victim) { // que encuentre el judgado en la base de datos
                        // comprobar que en los estado que tiene el participante no este muerto(caso en el que haya una desconexion)
                        if ($victim->states()->where('name', 'DEAD')->exists()) {
                            // si esta muerto no se le puede asignar el rol
                            // $messageText = 'RESULTADO: El participante elegido para alcalde está muerto. No se le puede asignar el rol.';
                            // hacer bucle para buscar uno valido(siempre tiene que haber uno)                            $validVictimFound = false;
                            $participants = $game->participants()->get();

                            foreach ($participants as $participant) {
                                if (! $participant->states->where('name', 'DEAD')->exists()) {
                                    $victim = $participant;
                                    // el primero que encuentre se asignará como alcalde
                                    break; // se que esto gusta poco pero es mas eficiente lo podemos quitar
                                }
                            }
                        } // no hace falta el else porque sería repetir el codigo
                        $councilState = State::where('name', 'COUNCIL')->first();
                        if ($councilState) {
                            $victim->states()->syncWithoutDetaching([$councilState->id]);
                            // $victim->states()->attach($councilState->id);
                            $messageText = $this->messageCouncilGenerator($victim->nickname);
                        } // si no encuenta el state que hacemos ??
                    }
                } else { // en caso de que no haya elegidos (nadie haya votado)
                    // escoger a alguien al azar de la partida
                    $participants = $game->participants()->get();
                    $randomParticipant = $participants->random();
                    $victim = $randomParticipant;
                    if ($victim) {
                        $councilState = State::where('name', 'COUNCIL')->first();
                        if ($councilState) {
                            $randomParticipant->states()->syncWithoutDetaching([$councilState->id]);
                            $messageText = $this->messageCouncilGenerator($randomParticipant->nickname);
                        }
                    } // si no encuentra ??

                }
            } else {
                // empate o no resuelto
                $messageText = $this->messageGenerator('none', 'none', false);
            }
            // Registrar el mensaje narrativo
            $messageObj = $game->addMessage('info', null, $messageText); // puede que esta sea una zona de fallos

            // comprobar condiciones de victoria (placeholder para otra HU)
            $winStatus = $this->checkWinConditions($game);

            // emitir eventos
            // evento 1: evento del resultado
            broadcast(new GameEvent(
                'vote.result',
                [
                    'message' => $messageObj->toStructured(),
                    'dead_participant' => $victim ? $victim->load('states') : null, // con esto controlo ambos casos
                    'game_condition' => $winStatus,
                ],
                $this->gameId

            ));
            // evento 2: mensaje de chat
            broadcast(new GameEvent(
                'chat.message',
                [
                    'message' => $messageObj->toStructured(),
                ],
                $this->gameId
            ));

            // Continuar el ciclo si el juego no ha terminado
            if (! $winStatus['finished']) {
                // Se dispara el inicio de la noche
                _03_TransitionToNightJob::dispatch($this->gameId)->delay(now()->addSeconds(5));
            } else {
                // si el juego termina, se emitiría game.finished que pertenece a otra hu
                broadcast(new GameEvent('game.finished', ['winners' => $winStatus['winners']], $this->gameId));
            }
        } else {
            // TODO en caso de que no sea succes controlar aquí que devuelve arriba
            // Error al resolver la votación de forma temporal dejo esto
            $messageText = 'Hubo un error al intentar resolver la votación :c';
            $messageObj = $game->addMessage('error', null, $messageText);
        }
    }

    private function messageGenerator($victimName, $roleName, $killed)
    {
        $killedMessages = [
            // genericas
            'RESULTADO: El pueblo ha decidido acabar con la vida de {nickname}, quien resultó ser un {roleName}.',
            'El veredicto es claro: {nickname} ha sido linchado y era un {roleName}.',
            'Tras una acalorada votación, {nickname} ha sido condenado. Su rol era {roleName}.',
            'Los aldeanos no tuvieron piedad: {nickname} fue ejecutado y se descubrió que era un {roleName}.',
            'El pueblo habló con firmeza: {nickname} ha caído, revelando su identidad como {roleName}.',
            'La asamblea decidió: {nickname} no verá otro amanecer, pues era un {roleName}.',
            'Entre gritos y acusaciones, {nickname} fue señalado y eliminado. Su rol: {roleName}.',
            'El linchamiento se consumó: {nickname} ha muerto y era un {roleName}.',
            'El pueblo, dividido pero resuelto, eligió a {nickname}. Su destino: la horca. Su rol: {roleName}.',
            'La multitud clamó justicia: {nickname} fue sentenciado y se reveló que era un {roleName}.',
            // Star Wars
            'En una galaxia muy, muy lejana... el consejo decidió que {nickname} debía caer. Su rol era {roleName}.',
            'La Fuerza no estuvo de su lado: {nickname} fue derrotado y reveló ser un {roleName}.',
            'El destino de {nickname} quedó sellado como en los juicios Jedi. Era un {roleName}.',

            // Cowboy Bebop
            'Bang... {nickname} ha sido eliminado por decisión del pueblo. Su rol: {roleName}.',
            'Como una recompensa más en la lista, {nickname} fue cazado y resultó ser un {roleName}.',
            'En este viaje sin retorno, {nickname} encontró su final. Era un {roleName}.',

            // Evangelion
            'El Tercer Impacto se acerca... {nickname} ha sido sacrificado y era un {roleName}.',
            'Entre gritos y ecos de Lilith, {nickname} fue condenado. Su rol: {roleName}.',
            'El Comité decidió: {nickname} debía desaparecer. Era un {roleName}.',

            // Señor de los Anillos
            'Un anillo no basta para ocultar la verdad: {nickname} ha caído y era un {roleName}.',
            'El consejo de Elrond habría estado de acuerdo: {nickname} fue sentenciado. Su rol: {roleName}.',
            'Como en las tierras de Mordor, {nickname} encontró su destino. Era un {roleName}.',
            // Juju Hakusho
            '{nickname} tenia que hacer un duelo a muerte con cuchillos, salió perdiendo. Su rol: {roleName}.',
            // One Piece
            'El juicio del mar ha hablado: {nickname} fue enviado al fondo del océano. Su rol era {roleName}.',
            'Como un pirata sin rumbo, {nickname} fue abandonado por la tripulación. Resultó ser un {roleName}.',
            'El rugido del Nuevo Mundo resonó: {nickname} cayó en la batalla y era un {roleName}.',

        ];
        $noKilledMessages = [
            // genericas
            'RESULTADO: La votación ha terminado sin un consenso claro. Nadie será linchado hoy.',
            'El pueblo discutió intensamente, pero no alcanzó un acuerdo. La jornada termina sin ejecuciones.',
            'Las voces se alzaron, pero ninguna decisión prevaleció. Hoy no habrá sangre en la plaza.',

            // Star Wars
            'La Fuerza permanece en equilibrio: ningún aldeano ha sido condenado en esta votación.',
            'El consejo Jedi no logró decidir. Nadie será expulsado al vacío estelar hoy.',
            'Como en el Senado Galáctico, las discusiones se prolongaron sin resolución. El día termina en calma.',

            // Cowboy Bebop
            'Bang... pero el disparo nunca llegó. Nadie ha sido linchado esta vez.',
            'La tripulación debatió, pero no hubo acuerdo. El espacio sigue silencioso.',
            'Entre humo de cigarrillos y jazz, la votación quedó en tablas. Nadie será eliminado.',

            // Evangelion
            'El Comité de Selección no alcanzó consenso. El destino de los aldeanos sigue incierto.',
            'Las almas se agitaron, pero ninguna decisión fue tomada. El Tercer Impacto se retrasa.',
            'El silencio de NERV domina la sala: nadie ha sido elegido para morir.',

            // Señor de los Anillos
            'Ni en Rivendel ni en Mordor se alcanzó acuerdo. Nadie caerá hoy.',
            'El consejo de los sabios no logró decidir. La Comarca permanece tranquila por ahora.',
            'Como en las tierras de Gondor, las voces se dividieron. Ningún linchamiento tendrá lugar.',

            // Juju Hakusho
            'Nadie supo que es un duelo a muerte con cuchillos. No hubo linchamiento hoy',

            // One Piece
            'El mar permanece en calma: la tripulación no logró decidir a quién linchar.',
            'La votación terminó como una tormenta sin rumbo. Nadie será arrojado por la borda.',
            'El pueblo discutió como piratas en cubierta, pero no hubo consenso. Hoy nadie muere.',
        ];

        $phrase = $killed ? $killedMessages[array_rand($killedMessages)] : $noKilledMessages[array_rand($noKilledMessages)];

        $messageContructed = $killed ? str_replace(['{nickname}', '{roleName}'], [$victimName, $roleName], $phrase) : $phrase;

        return $messageContructed;
    }

    private function messageCouncilGenerator($victimName)
    {
        $councilMessages = [
            // genericos
            'RESULTADO: El pueblo ha decidido que {nickname} será el nuevo alcalde.',
            'Entre vítores y aplausos, {nickname} ha sido elegido como alcalde.',
            'La votación concluyó y {nickname} se alza como líder del pueblo.',
            'El pueblo habló con firmeza: {nickname} ocupará el cargo de alcalde.',
            'La asamblea ha terminado: {nickname} es proclamado alcalde.',

            // Star Wars
            'La Fuerza guía al pueblo: {nickname} ha sido nombrado alcalde.',
            'Como un verdadero Jedi del consejo, {nickname} ha sido elegido alcalde.',
            'El Senado galáctico habría estado orgulloso: {nickname} es ahora alcalde.',

            // Cowboy Bebop
            'Bang... {nickname} ha sido elegido alcalde, listo para liderar esta tripulación.',
            'Entre jazz y humo, {nickname} se convierte en el nuevo alcalde.',
            'La votación terminó en estilo Bebop: {nickname} es el alcalde.',

            // Evangelion
            'El Comité ha decidido: {nickname} será el alcalde.',
            'Entre ecos del Tercer Impacto, {nickname} emerge como alcalde.',
            'NERV proclama que {nickname} ocupará el puesto de alcalde.',

            // Señor de los Anillos
            'El consejo de Elrond habría estado de acuerdo: {nickname} es el nuevo alcalde.',
            'Como un rey en Gondor, {nickname} ha sido proclamado alcalde.',
            'El pueblo de la Comarca celebra: {nickname} es elegido alcalde.',

            // One Piece
            'La tripulación ha decidido: {nickname} será el capitán... digo, el alcalde.',
            'El rugido del mar anuncia que {nickname} es el nuevo alcalde.',
            'Como en una asamblea pirata, {nickname} ha sido elegido alcalde.',
            'En una isla del nuevo mundo {nickname} salío como alcalde, que no se entere imu',
        ];
        $messageContructed = $councilMessages[array_rand($councilMessages)];

        $messageContructed = str_replace(['{nickname}'], [$victimName], $messageContructed);

        return $messageContructed;
    }

    /**
     * Método auxiliar para comprobar victoria.
     * Debe ser reemplazado por el servicio real cuando esté disponible.
     */
    private function checkWinConditions(Game $game): array
    {
        // TODO: Integrar con GameService::checkVictory($game)
        return [
            'finished' => false,
            'winners' => null,
        ];
    }
}

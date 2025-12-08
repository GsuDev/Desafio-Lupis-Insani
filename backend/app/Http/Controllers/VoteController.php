<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\participant;
use App\Models\State;
use App\Models\Votation;
use App\Models\Vote;
use App\Services\BotVoteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VoteController extends Controller
{
    public static function vote($data, $gameId, $user)
    {
        /*
        $validated = $request->validate([
            'game_id' => 'required|integer|exists:games,id',
            'voter_id' => 'required|integer|exists:participants,id',
            'target_id' => 'required|integer|exists:participants,id',
            'is_day' => 'required|boolean',
            'day_number' => 'required|integer|min:1',
        */
        // 1. Validación básica de inputs
        $validator = Validator::make($data, [
            'targetId' => 'required|integer|exists:participants,id',
            'isDay' => 'required|boolean',
            'dayNumber' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return [
                'success' => false,
                'message' => $validator->errors(),
                'data' => null,
            ];
        }

        $voteData = $validator->validated();

        // 2. Participante votante
        $participant = Participant::where('user_id', $user->id)
            ->where('game_id', $gameId)
            ->with('states')
            ->first();

        /*$check = ($participant->id != $voteData['targetId']);
        if (! $check['success']) {
            return $check;
        }*/

        $check = self::validateUserInGame($participant);
        if (! $check['success']) {
            return $check;
        }

        // 3. Validar ciclo día/noche según BBDD
        $check = self::validateCycle($gameId, $voteData['dayNumber'], $voteData['isDay']);
        if (! $check['success']) {
            return $check;
        }

        // 4. Validaciones según fase (día o noche)
        $check = self::validatePhaseRestrictions($participant, $voteData['targetId'], $voteData['isDay']);
        if (! $check['success']) {
            return $check;
        }

        // 5. Validar objetivo vivo

        $check = self::validateTargetAlive($voteData['targetId']);
        if (! $check['success']) {
            return $check;
        }

        $game = Game::find($gameId);

        if (! $game) {
            return [
                'success' => false,
                'message' => 'La partida no existe.',
                'status' => 404,
                'data' => null,
            ];
        }
        // Busco la votación activa o la creo si es el primer voto del turno
        $votation = self::getLatestVotation($game);

        // Comprobacion de seguridad: ¿Está cerrada la votación?
        if ($votation->is_closed) {
            return [
                'success' => false,
                'message' => 'Esta votación ya está cerrada.',
                'status' => 403,
                'data' => null,
            ];
        }

        // 6. Validar que no haya votado ya (AHORA USANDO EL ID DE LA VOTACIÓN)
        $check = self::validateRepeatedVote($participant->id, $votation->id);
        if (! $check['success']) {
            return $check;
        }

        // Registrar voto (SOLO DATOS DE LA TABLA VOTES)
        $vote = Vote::create([
            'votation_id' => $votation->id,
            'voter_id' => $participant->id,
            'target_id' => $voteData['targetId'],
        ]);

        return [
            'success' => true,
            'message' => 'Voto registrado correctamente',
            'data' => ['vote' => $vote],
        ];
    }

    public static function cancelVote($data, $gameId, $user)
    {
        /*
        $validated = $request->validate([
            'game_id' => 'required|integer|exists:games,id',
            'voter_id' => 'required|integer|exists:participants,id',
            'target_id' => 'required|integer|exists:participants,id',
            'is_day' => 'required|boolean',
            'day_number' => 'required|integer|min:1',
        */
        // 1. Validación básica de inputs
        $validator = Validator::make($data, [
            'targetId' => 'required|integer|exists:participants,id',
            'isDay' => 'required|boolean',
            'dayNumber' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return [
                'success' => false,
                'message' => $validator->errors(),
                'data' => null,
            ];
        }

        $voteData = $validator->validated();

        // 2. Participante votante
        $participant = Participant::where('user_id', $user->id)
            ->where('game_id', $gameId)
            ->with('states')
            ->first();

        $check = self::validateUserInGame($participant);
        if (! $check['success']) {
            return $check;
        }

        // 3. Validar ciclo día/noche según BBDD
        $check = self::validateCycle($gameId, $voteData['dayNumber'], $voteData['isDay']);
        if (! $check['success']) {
            return $check;
        }

        // 4. Validaciones según fase (día o noche)
        $check = self::validatePhaseRestrictions($participant, $voteData['targetId'], $voteData['isDay']);
        if (! $check['success']) {
            return $check;
        }

        // 5. Validar objetivo vivo

        $check = self::validateTargetAlive($voteData['targetId']);
        if (! $check['success']) {
            return $check;
        }

        $game = Game::find($gameId);

        if (! $game) {
            return [
                'success' => false,
                'message' => 'La partida no existe.',
                'status' => 404,
                'data' => null,
            ];
        }
        // Busco la votación activa o la creo si es el primer voto del turno
        $votation = self::getLatestVotation($game);

        // Comprobacion de seguridad: ¿Está cerrada la votación?
        if ($votation->is_closed) {
            return [
                'success' => false,
                'message' => 'Esta votación ya está cerrada.',
                'status' => 403,
                'data' => null,
            ];
        }

        // 6. Validar que no haya votado ya (AHORA USANDO EL ID DE LA VOTACIÓN)
        $check = self::validateRepeatedVote($participant->id, $votation->id);
        if (! $check['success']) {
            return $check;
        }

        // Borrar voto
        $vote = Vote::where('voter_id', $voteData['voterId'])
            ->where('target_id', $voteData['targetId'])
            ->where('votation_id', $votation->id)
            ->first();

        if ($vote) {
            $vote->delete();
        }

        return [
            'success' => true,
            'message' => 'Voto cancelado correctamente',
            'data' => ['vote' => $vote],
        ];
    }

    /**
     * Obtiene los votos filtrados por partida, fase y ciclo.
     */
    public function getVotes(Request $request, $gameId)
    {
        $request->validate([
            'is_day' => 'required|boolean',
            'day_number' => 'required|integer',
        ]);

        // Uso la auxiliar que devuelve el objeto Votation
        $votation = $this->queryVotation(
            (int) $gameId,
            $request->boolean('is_day'),
            (int) $request->input('day_number')
        );

        // $votes = Vote::where('game_id', $gameId)
        //     ->where('is_day', $request->boolean('is_day'))
        //     ->where('day_number', $request->input('day_number'))
        //     ->get();

        // Si no existe la votación, devuelvo el array vacío para no romper el front pero si quereis se puede cambiar por return success false
        $votes = $votation ? $votation->votes : [];

        return [
            'success' => true,
            'message' => 'Votos recuperados con éxito',
            'data' => ['votes' => $votes],
        ];
    }

    // Los parametros de entreda se pueden cambiar por Request $request, pero por el momento lo manejo asi

    public static function resolveVoting(int $gameId, string $phase, int $cycle)
    {
        // ------------------------------------------------------------ este apartado se cambía si se le proporciona el Request

        // convierto el phase a booleano
        $isDay = ($phase === 'day');
        $dayNumber = $cycle;

        // obtengo la votacion con los votos y los datos del votante (para ver si es alcalde)
        $votation = Votation::where('game_id', $gameId)
            ->where('is_day', $isDay)
            ->where('day_number', $dayNumber)
            ->with(['votes.voter.states']) // Eager loading: traemos el voto y al votante y los estados
            ->first();

        if (! $votation || $votation->is_closed) {
            return [
                'success' => false,
                'message' => 'No hay votación para resolver',
                'data' => null,
            ];
        }
        // } elseif ($votation->votes->isEmpty()) {
        //     return response()->json([
        //         'success' => true,
        //         'message' => 'Votación resuelta',
        //         'data' => [
        //             'is_day' => $isDay, // lo paso para saber si ha sido votacion de lobos o de linchamiento
        //             'resolved_candidate_id' => null,
        //             'tie_method' => false,
        //             'votes_count' => 0,
        //         ],
        //     ]);
        // }
        // Cambiar la respuesa si los votos estan vacios
        // si devuelve esto significa que algo salió mal o que no recibió votos, por lo que se puede tratar para casos que no haya votos

        // logica del conteo
        // Recuento con ponderación
        $tally = []; // Array para contar: [id_candidato => total_puntos]

        $MAYOR_STATE_NAME = 'COUNCIL'; // sacarlo al env

        $userVotes = $votation->votes;
        $botVotes = BotVoteService::applyBotVotes($userVotes, $gameId, $phase, $cycle, $votation->id);
        // obtengo la votacion con los votos y los datos del votante (para ver si es alcalde)
        $votation = Votation::where('game_id', $gameId)
            ->where('is_day', $isDay)
            ->where('day_number', $dayNumber)
            ->with(['votes.voter.states']) // Eager loading: traemos el voto y al votante y los estados
            ->first();
        $currentVotes = $votation->votes;

        foreach ($currentVotes as $vote) {
            $points = 1;

            // Doble voto del alcalde
            if ($isDay) {
                // Verifico si la colección de estados del votante contiene el estado 'alcalde'
                // contains('columna', 'valor') busca en la colección en memoria
                $isMayor = $vote->voter->states->contains('name', $MAYOR_STATE_NAME);

                if ($isMayor) {
                    $points = 2;
                }
            }

            // Sumar votos (acumulamos puntos)
            if (! isset($tally[$vote->target_id])) {
                $tally[$vote->target_id] = 0;
            }
            $tally[$vote->target_id] += $points;
        }
        // sumar los votos de los bots

        // ordeno para tener los maximos
        arsort($tally);
        $maxVotes = reset($tally); // obtengo el valor maximo

        // obtengo todos los candidatos con esa cantidad de votos
        $candidates = array_keys($tally, $maxVotes);

        // compruebo los empates
        $isTie = count($candidates) > 1;
        $tieMethod = null;
        $victimId = null;

        // selecciono uno por "coinflip"
        if ($isTie) {
            $randomKey = array_rand($candidates);
            $victimId = $candidates[$randomKey];

            $tieMethod = 'coinflip';
        } else {
            // Ganador único
            $victimId = $candidates[0];
            $tieMethod = 'none';
        }

        /*
            Esto es lo que tendría que hacer desde el padre que llama a esta funcion
            Ya que el resto de eventos se se tienen que ejecutar desde arriba en funcion del resultado y no desde aqui
        $victim = \App\Models\Participant::find($victimId);
        $votation->update(['is_closed' => true]);

        if ($victim) {
            $victim->status = 'dead';
            $victim->save();
            if ($isDay) {
                // Evento Linchamiento
                // event(new GameEvent($gameId, 'lynched', $victim));
            } else {
                // Evento Lobos
                // event(new WolvesEvent($gameId, 'killed', $victim));
            }
        }
         */

        return [
            'success' => true,
            'message' => 'Votación resuelta',
            'data' => [
                'is_day' => $isDay, // lo paso para saber si ha sido votacion de lobos o de linchamiento
                'resolved_candidate_id' => $victimId,
                'tie_method' => $tieMethod,
                'votes_count' => $maxVotes,
            ],
        ];
    }

    /**
     * Helper: Busca una Votation y carga sus votos (Eager Loading)
     * Devuelve null si no existe.
     */
    private function queryVotation(int $gameId, bool $isDay, int $dayNumber): ?Votation
    {
        return Votation::where('game_id', $gameId)
            ->where('is_day', $isDay)
            ->where('day_number', $dayNumber)
            ->with('votes') // <----------- Trae los votos en la misma consulta
            ->first();
    }

    private static function validateUserInGame($participant)
    {
        if (! $participant) {
            return [
                'success' => false,
                'message' => 'No perteneces a esta partida.',
                'status' => 403,
                'data' => null,
            ];
        }

        return ['success' => true];
    }

    // TODO VICTOR: CAMBIAR PARA VALIDAR QUE NO VOTE EN UN CICLO (combinacion dayNumber y isDay) que no debe
    private static function validateCycle($gameId, $dayNumber, $isDay)
    {
        $game = Game::find($gameId);

        if (! $game) {
            return [
                'success' => false,
                'message' => 'La partida no existe.',
                'status' => 404,
                'data' => null,
            ];
        }
        $latestVotation = self::getLatestVotation($game);
        $latestDay = $latestVotation->day_number;
        $latestPhase = $latestVotation->is_day;

        if ($latestDay != $dayNumber || (bool) $latestPhase != (bool) $isDay) {
            return [
                'success' => false,
                'message' => 'El ciclo enviado no coincide con el actual.',
                'status' => 422,
                'data' => null,
            ];
        }

        return ['success' => true];
    }

    // Entiendase phase por day/night
    private static function validatePhaseRestrictions($participant, $targetId, $isDay)
    {
        $role = $participant->character_id;

        $target = Participant::find($targetId);

        // === NOCHE ===
        if (! $isDay) {
            // Noche: Solo lobos (ID 2, ajusta según tu DB)
            if ($role !== 2) {
                return ['success' => false, 'message' => 'Solo los lobos pueden votar de noche.', 'status' => 422, 'data' => null];
            }
            if ($target->character_id === 2) {
                return ['success' => false, 'message' => 'Un lobo no puede votar a otro lobo.', 'status' => 422, 'data' => null];
            }
        }

        // DÍA -> todos los vivos pueden votar, no hay restricciones especiales
        return ['success' => true];
    }

    private static function validateTargetAlive($targetId)
    {
        $target = Participant::with('states')->find($targetId);

        if (! $target) {
            return [
                'success' => false,
                'message' => 'El jugador objetivo no existe.',
                'status' => 422,
                'data' => null,
            ];
        }

        // muerto si tiene state y state = 'dead'
        if ($target->states()->where('name', 'DEAD')->exists()) {
            return [
                'success' => false,
                'message' => 'Ese jugador está muerto.',
                'status' => 422,
                'data' => null,
            ];
        }

        return ['success' => true];
    }

    private static function validateRepeatedVote($voterId, $votationId)
    {
        $exists = Vote::where('voter_id', $voterId)
            ->where('votation_id', $votationId) // Buscamos en la votación actual
            ->exists();

        if ($exists) {
            return [
                'success' => false,
                'message' => 'Ya has votado en esta fase a ese jugador.',
                'status' => 422,
                'data' => null,
            ];
        }

        return ['success' => true];
    }

    // private static function validateRepeatedVote($voterId, $gameId, $dayNumber, $isDay)
    // {
    //     $exists = Vote::where('voter_id', $voterId)
    //         ->where('game_id', $gameId)
    //         ->where('day_number', $dayNumber)
    //         ->where('is_day', $isDay)
    //         ->exists();

    //     if ($exists) {
    //         return [
    //             'success' => false,
    //             'message' => 'Ya has votado en esta fase.',
    //             'status' => 422,
    //             'data' => null,
    //         ];
    //     }

    //     return ['success' => true];
    // }

    public static function getLatestVotation($game)
    {

        // $latestDay = $game->votations()->latest()->day_number; // busco el ultimo dia en las votaciones de la partida porque teoricamente sería el ultimo añadido por lo que es el dia actual
        $latestVotation = $game->votations()->latest('day_number')->first();

        return $latestVotation;
    }

    public static function closeLatestVotation($latestVotation)
    {

        $latestDay = $latestVotation?->day_number ?? 0;

        // Aqui se cierra la votación en bbdd
        $latestVotation->is_closed = true;

        if ($latestVotation) {
            $latestVotation->update(['is_closed' => true]);
        } // cierro la votación

        return $latestVotation;
    }

    public static function startVotation(int $gameId, string $phase, int $dayNumber)
    {
        $votation = new Votation(['game_id' => $gameId, 'is_day' => ($phase === 'day'), 'day_number' => $dayNumber, 'is_closed' => false]);
        $votation->save();

        return $votation;
    }

    /**
     * Procesa el resultado de la votación de día
     *
     * @return array ['victim' => Participant|null, 'message' => string, 'is_council' => bool]
     */
    public static function processVillagerVotingResult(Game $game, ?int $victimId, bool $isFirstDay): array
    {
        if ($victimId === null) {
            if ($isFirstDay) {
                // Seleccionar alcalde aleatorio si no hay votos
                return self::selectRandomCouncil($game);
            }

            // No hay víctima ni es primer día
            return [
                'victim' => null,
                'message' => self::generateVotingMessage(null, null, false),
                'is_council' => false,
            ];
        }

        $victim = Participant::find($victimId);

        if (! $victim) {
            return [
                'victim' => null,
                'message' => 'RESULTADO: El silencio reina. No se han emitido votos suficientes.',
                'is_council' => false,
            ];
        }

        if ($isFirstDay) {
            return self::assignCouncilRole($game, $victim);
        }

        // Día normal: marcar como muerto
        return self::killParticipant($victim);
    }

    /**
     * Mata a un participante y retorna la información
     */
    private static function killParticipant(Participant $victim): array
    {
        $deadState = State::where('name', 'DEAD')->first();

        if ($deadState) {
            $victim->states()->syncWithoutDetaching([$deadState->id]);
        }

        $roleName = self::getParticipantRoleName($victim);

        return [
            'victim' => $victim->fresh()->load('states'),
            'message' => self::generateVotingMessage($victim->nickname, $roleName, true),
            'is_council' => false,
        ];
    }

    /**
     * Asigna el rol de alcalde (COUNCIL)
     */
    private static function assignCouncilRole(Game $game, Participant $victim): array
    {
        // Si está muerto, buscar otro válido
        if ($victim->states()->where('name', 'DEAD')->exists()) {
            $victim = self::findAliveParticipant($game);
        }

        if (! $victim) {
            return [
                'victim' => null,
                'message' => 'No hay participantes vivos disponibles.',
                'is_council' => true,
            ];
        }

        $councilState = State::where('name', 'COUNCIL')->first();

        if ($councilState) {
            $victim->states()->syncWithoutDetaching([$councilState->id]);
        }

        return [
            'victim' => $victim->fresh()->load('states'),
            'message' => self::generateCouncilMessage($victim->nickname),
            'is_council' => true,
        ];
    }

    /**
     * Selecciona un alcalde aleatorio
     */
    private static function selectRandomCouncil(Game $game): array
    {
        $participants = $game->participants()->get();
        $aliveParticipants = $participants->filter(function ($p) {
            return ! $p->states()->where('name', 'DEAD')->exists();
        });

        if ($aliveParticipants->isEmpty()) {
            return [
                'victim' => null,
                'message' => 'No hay participantes vivos para seleccionar como alcalde.',
                'is_council' => true,
            ];
        }

        $randomParticipant = $aliveParticipants->random();
        $councilState = State::where('name', 'COUNCIL')->first();

        if ($councilState) {
            $randomParticipant->states()->syncWithoutDetaching([$councilState->id]);
        }

        return [
            'victim' => $randomParticipant->fresh()->load('states'),
            'message' => self::generateCouncilMessage($randomParticipant->nickname),
            'is_council' => true,
        ];
    }

    /**
     * Encuentra el primer participante vivo
     */
    private static function findAliveParticipant(Game $game): ?Participant
    {
        $participants = $game->participants()->get();

        foreach ($participants as $participant) {
            if (! $participant->states()->where('name', 'DEAD')->exists()) {
                return $participant;
            }
        }

        return null;
    }

    /**
     * Obtiene el nombre del rol de un participante
     */
    private static function getParticipantRoleName(Participant $participant): string
    {
        if ($participant->character) {
            return $participant->character->name;
        }

        if ($participant->character_id === 2) {
            return 'Lobo';
        }

        return 'Aldeano';
    }

    /**
     * Genera mensaje de resultado de votación
     */
    public static function generateVotingMessage(?string $victimName, ?string $roleName, bool $killed): string
    {
        $killedMessages = [
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
            'En una galaxia muy, muy lejana... el consejo decidió que {nickname} debía caer. Su rol era {roleName}.',
            'La Fuerza no estuvo de su lado: {nickname} fue derrotado y reveló ser un {roleName}.',
            'El destino de {nickname} quedó sellado como en los juicios Jedi. Era un {roleName}.',
            'Bang... {nickname} ha sido eliminado por decisión del pueblo. Su rol: {roleName}.',
            'Como una recompensa más en la lista, {nickname} fue cazado y resultó ser un {roleName}.',
            'En este viaje sin retorno, {nickname} encontró su final. Era un {roleName}.',
            'El Tercer Impacto se acerca... {nickname} ha sido sacrificado y era un {roleName}.',
            'Entre gritos y ecos de Lilith, {nickname} fue condenado. Su rol: {roleName}.',
            'El Comité decidió: {nickname} debía desaparecer. Era un {roleName}.',
            'Un anillo no basta para ocultar la verdad: {nickname} ha caído y era un {roleName}.',
            'El consejo de Elrond habría estado de acuerdo: {nickname} fue sentenciado. Su rol: {roleName}.',
            'Como en las tierras de Mordor, {nickname} encontró su destino. Era un {roleName}.',
            '{nickname} tenia que hacer un duelo a muerte con cuchillos, salió perdiendo. Su rol: {roleName}.',
            'El juicio del mar ha hablado: {nickname} fue enviado al fondo del océano. Su rol era {roleName}.',
            'Como un pirata sin rumbo, {nickname} fue abandonado por la tripulación. Resultó ser un {roleName}.',
            'El rugido del Nuevo Mundo resonó: {nickname} cayó en la batalla y era un {roleName}.',
        ];

        $noKilledMessages = [
            'RESULTADO: La votación ha terminado sin un consenso claro. Nadie será linchado hoy.',
            'El pueblo discutió intensamente, pero no alcanzó un acuerdo. La jornada termina sin ejecuciones.',
            'Las voces se alzaron, pero ninguna decisión prevaleció. Hoy no habrá sangre en la plaza.',
            'La Fuerza permanece en equilibrio: ningún aldeano ha sido condenado en esta votación.',
            'El consejo Jedi no logró decidir. Nadie será expulsado al vacío estelar hoy.',
            'Como en el Senado Galáctico, las discusiones se prolongaron sin resolución. El día termina en calma.',
            'Bang... pero el disparo nunca llegó. Nadie ha sido linchado esta vez.',
            'La tripulación debatió, pero no hubo acuerdo. El espacio sigue silencioso.',
            'Entre humo de cigarrillos y jazz, la votación quedó en tablas. Nadie será eliminado.',
            'El Comité de Selección no alcanzó consenso. El destino de los aldeanos sigue incierto.',
            'Las almas se agitaron, pero ninguna decisión fue tomada. El Tercer Impacto se retrasa.',
            'El silencio de NERV domina la sala: nadie ha sido elegido para morir.',
            'Ni en Rivendel ni en Mordor se alcanzó acuerdo. Nadie caerá hoy.',
            'El consejo de los sabios no logró decidir. La Comarca permanece tranquila por ahora.',
            'Como en las tierras de Gondor, las voces se dividieron. Ningún linchamiento tendrá lugar.',
            'Nadie supo que es un duelo a muerte con cuchillos. No hubo linchamiento hoy',
            'El mar permanece en calma: la tripulación no logró decidir a quién linchar.',
            'La votación terminó como una tormenta sin rumbo. Nadie será arrojado por la borda.',
            'El pueblo discutió como piratas en cubierta, pero no hubo consenso. Hoy nadie muere.',
        ];

        $phrase = $killed ? $killedMessages[array_rand($killedMessages)] : $noKilledMessages[array_rand($noKilledMessages)];

        return $killed ? str_replace(['{nickname}', '{roleName}'], [$victimName, $roleName], $phrase) : $phrase;
    }

    /**
     * Genera mensaje de elección de alcalde
     */
    public static function generateCouncilMessage(string $victimName): string
    {
        $councilMessages = [
            'RESULTADO: El pueblo ha decidido que {nickname} será el nuevo alcalde.',
            'Entre vítores y aplausos, {nickname} ha sido elegido como alcalde.',
            'La votación concluyó y {nickname} se alza como líder del pueblo.',
            'El pueblo habló con firmeza: {nickname} ocupará el cargo de alcalde.',
            'La asamblea ha terminado: {nickname} es proclamado alcalde.',
            'La Fuerza guía al pueblo: {nickname} ha sido nombrado alcalde.',
            'Como un verdadero Jedi del consejo, {nickname} ha sido elegido alcalde.',
            'El Senado galáctico habría estado orgulloso: {nickname} es ahora alcalde.',
            'Bang... {nickname} ha sido elegido alcalde, listo para liderar esta tripulación.',
            'Entre jazz y humo, {nickname} se convierte en el nuevo alcalde.',
            'La votación terminó en estilo Bebop: {nickname} es el alcalde.',
            'El Comité ha decidido: {nickname} será el alcalde.',
            'Entre ecos del Tercer Impacto, {nickname} emerge como alcalde.',
            'NERV proclama que {nickname} ocupará el puesto de alcalde.',
            'El consejo de Elrond habría estado de acuerdo: {nickname} es el nuevo alcalde.',
            'Como un rey en Gondor, {nickname} ha sido proclamado alcalde.',
            'El pueblo de la Comarca celebra: {nickname} es elegido alcalde.',
            'La tripulación ha decidido: {nickname} será el capitán... digo, el alcalde.',
            'El rugido del mar anuncia que {nickname} es el nuevo alcalde.',
            'Como en una asamblea pirata, {nickname} ha sido elegido alcalde.',
            'En una isla del nuevo mundo {nickname} salío como alcalde, que no se entere imu',
        ];

        $message = $councilMessages[array_rand($councilMessages)];

        return str_replace('{nickname}', $victimName, $message);
    }

    /**
     * Procesa el resultado de la votación de los lobos (noche)
     *
     * @return array ['victim' => Participant|null, 'message' => string]
     */
    public static function processWolvesVotingResult(Game $game, ?int $victimId): array
    {
        if ($victimId === null) {
            // No hay víctima - los lobos no votaron o hubo empate sin resolver
            return [
                'victim' => null,
                'message' => self::generateWolvesMessage(null, null, false),
            ];
        }

        $victim = Participant::find($victimId);

        if (! $victim) {
            return [
                'victim' => null,
                'message' => 'RESULTADO: Los aullidos se desvanecen en la noche. No hubo víctima.',
            ];
        }

        // Marcar como muerto y obtener rol
        $deadState = State::where('name', 'DEAD')->first();

        if ($deadState) {
            $victim->states()->syncWithoutDetaching([$deadState->id]);
        }

        $roleName = self::getParticipantRoleName($victim);

        return [
            'victim' => $victim->fresh()->load('states'),
            'message' => self::generateWolvesMessage($victim->nickname, $roleName, true),
        ];
    }

    /**
     * Genera mensajes de resultado de votación de lobos
     */
    public static function generateWolvesMessage(?string $victimName, ?string $roleName, bool $killed): string
    {
        $killedMessages = [
            // Mensajes genéricos de lobos
            'RESULTADO: Los lobos han cazado a {nickname} durante la noche. Era un {roleName}.',
            'La manada atacó sin piedad: {nickname} fue devorado. Su rol: {roleName}.',
            'Los aullidos resonaron en la oscuridad. {nickname} no verá el amanecer. Era {roleName}.',
            'La caza nocturna fue exitosa: {nickname} cayó ante las garras de los lobos. Rol: {roleName}.',
            'Entre sombras y colmillos, {nickname} encontró su fin. Era un {roleName}.',

            // Star Wars
            'El lado oscuro prevaleció: {nickname} fue eliminado por los Sith... digo, los lobos. Era {roleName}.',
            'Como en una emboscada del Imperio, {nickname} cayó en la noche. Su rol: {roleName}.',

            // Cowboy Bebop
            'See you space cowboy... {nickname} no sobrevivió esta noche. Era {roleName}.',
            'La noche se los tragó: {nickname} desapareció como en un sueño. Rol: {roleName}.',

            // Evangelion
            'Un ángel atacó en la noche: {nickname} fue la víctima. Era un {roleName}.',
            'El comité nocturno decidió: {nickname} no verá otro día. Rol: {roleName}.',

            // Señor de los Anillos
            'Los wargs atacaron en la oscuridad: {nickname} cayó. Era {roleName}.',
            'Como en las tierras de Mordor, la noche reclamó a {nickname}. Su rol: {roleName}.',

            // One Piece
            'Los piratas de la noche atacaron: {nickname} fue su tesoro. Era {roleName}.',
            'El mar nocturno se llevó a {nickname}. Su rol era {roleName}.',
        ];

        $noKilledMessages = [
            // Genéricos
            'RESULTADO: Los lobos no lograron ponerse de acuerdo. Nadie murió esta noche.',
            'La manada discutió en las sombras, pero no hubo víctima esta noche.',
            'Los aullidos se escucharon, pero el pueblo amaneció completo.',
            'La caza nocturna fracasó. Todos sobrevivieron hasta el alba.',

            // Star Wars
            'La Fuerza protegió al pueblo esta noche. Ningún aldeano cayó.',
            'Los Sith discutieron pero no atacaron. El pueblo está a salvo.',

            // Cowboy Bebop
            'Bang... pero nadie cayó esta noche. Los lobos se fueron con las manos vacías.',

            // Evangelion
            'El AT Field protegió a todos esta noche. No hubo víctimas.',

            // Señor de los Anillos
            'Los guardias de la noche cumplieron su deber. Nadie murió.',

            // One Piece
            'La tripulación nocturna no logró decidir. Todos viven otro día.',
        ];

        $phrase = $killed ? $killedMessages[array_rand($killedMessages)] : $noKilledMessages[array_rand($noKilledMessages)];

        return $killed ? str_replace(['{nickname}', '{roleName}'], [$victimName, $roleName], $phrase) : $phrase;
    }
}

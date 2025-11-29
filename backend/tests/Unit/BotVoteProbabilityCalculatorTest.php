<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\BotVoteProbabilityCalculator;

class BotVoteProbabilityCalculatorTest extends TestCase
{
    /**
     * Si la dispersión es 0, solo los candidatos ya votados deben recibir probabilidad.
     */
    public function test_calculate_probabilities_dispersion_zero_strict_following()
    {
        // arrange
        // se simula que 3 personas ya recibieron votos humanos
        $votedParticipants = [
            ['id' => 1, 'votes' => 10],
            ['id' => 2, 'votes' => 5],
            ['id' => 3, 'votes' => 1]
        ];
        
        // Hay 10 participantes en total vivos
        $allParticipants = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        
        $dispersion = 0.0; // los bots son conservadores

        $calculator = new BotVoteProbabilityCalculator();

        // act
        $result = $calculator->calculateProbabilities($votedParticipants, $allParticipants, $dispersion);

        // se verifica assert
        
        // Debe haber exactamente 3 candidatos los 3 votados
        $this->assertCount(3, $result, 'Con dispersión 0, solo deberían estar los 3 candidatos votados');
        
        // Comprobamos que los IDs 1, 2 y 3 están en el resultado
        $this->assertArrayHasKey(1, $result);
        $this->assertArrayHasKey(2, $result);
        $this->assertArrayHasKey(3, $result);
        
        // El ID 4 NO debería estar (porque nadie lo votó y la dispersión es 0)
        $this->assertArrayNotHasKey(4, $result, 'El participante 4 no debería tener votos con dispersión 0');
    }
}
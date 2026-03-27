<?php

namespace Database\Seeders;

use App\Models\AgentProfile;
use Illuminate\Database\Seeder;

class AgentProfileSeeder extends Seeder
{
    public function run(): void
    {
        $agents = [
            ['name' => 'May Ligad Phillies'],
            ['name' => 'Ann Jamorol Phillies'],
            ['name' => 'Pauline Aquino Phillies'],
            ['name' => 'Zac Castro Phillies'],
            ['name' => 'Jerieme Padoc Phillies'],
            ['name' => 'Francine Del Mundo Phillies'],
            ['name' => 'Benjie Magbanua Phillies'],
            ['name' => 'Patricia Aranes Phillies'],
            ['name' => 'Luke Flores Phillies'],
            ['name' => 'Anjo Aquino Phillies'],
            ['name' => 'Kiel Asiniero Phillies'],
            ['name' => 'JM Dequilla Phillies'],
            ['name' => 'Mary Arellano Phillies'],
            ['name' => 'Jasmin Amistoso Phillies'],
            ['name' => 'Jhon Denver Manongdo Phillies'],
            ['name' => 'Alfred Mariano Phillies'],
            ['name' => 'Karen Perez Phillies'],
        ];

        foreach ($agents as $agent) {
            AgentProfile::firstOrCreate(
                ['name' => $agent['name']],
                ['status' => 'active']
            );
        }
    }
}

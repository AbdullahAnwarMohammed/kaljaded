<?php

namespace App\Repositories\Dashboard;

use App\Models\Admin;

class AdminRepository
{
    public function all()
    {
        return Admin::all();
    }

    public function create(array $data): Admin
    {
        return Admin::create($data);
    }

    public function find($id): ?Admin
    {
        return Admin::find($id);
    }
}

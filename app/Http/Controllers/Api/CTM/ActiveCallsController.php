<?php

namespace App\Http\Controllers\Api\CTM;

use App\Http\Controllers\Controller;
use App\Services\CTM\CTMFacade;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ActiveCallsController extends Controller
{
    protected CTMFacade $ctm;

    public function __construct()
    {
        $this->ctm = new CTMFacade();
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $params = ['status' => 'in_progress'];
            $calls = $this->ctm->calls->getCalls($params);
            return response()->json(['data' => $calls]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

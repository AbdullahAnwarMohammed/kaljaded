<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\SiteView;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SiteVisitController extends Controller
{
    use ApiResponseTrait;

    public function store(Request $request)
    {
        $ip = $request->ip();
        $userId = auth()->guard('sanctum')->id();
        $today = Carbon::today();

        // Check if this IP has already visited today
        $existingVisit = SiteView::whereDate('created_at', $today)
            ->where('ip_address', $ip)
            ->first();

        if ($existingVisit) {
            // If we now have a user_id but the existing record didn't, update it
            if ($userId && !$existingVisit->user_id) {
                $existingVisit->update(['user_id' => $userId]);
            }
        } else {
            // New visit for this IP today
            SiteView::create([
                'ip_address' => $ip,
                'user_id' => $userId,
            ]);
        }

        return $this->successResponse(null, 'Visit recorded');
    }

    public function index()
    {
        // Daily Stats (Last 30 days)
        $dailyStats = SiteView::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as total_visits')
        )
        ->groupBy('date')
        ->orderBy('date', 'desc')
        ->limit(30)
        ->get();

        // Monthly Stats (Last 12 months)
        $monthlyStats = SiteView::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as total_visits')
        )
        ->groupBy('month')
        ->orderBy('month', 'desc')
        ->limit(12)
        ->get();

        return $this->successResponse([
            'daily' => $dailyStats,
            'monthly' => $monthlyStats,
        ], 'messages.site_stats_retrieved');
    }

    public function currentStats()
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();

        $todayVisits = SiteView::whereDate('created_at', $today)->count();
        $thisMonthVisits = SiteView::where('created_at', '>=', $thisMonth)->count();

        return $this->successResponse([
            'today' => $todayVisits,
            'this_month' => $thisMonthVisits,
        ], 'messages.current_site_stats_retrieved');
    }
}

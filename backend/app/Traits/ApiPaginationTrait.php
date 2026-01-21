<?php

namespace App\Traits;

trait ApiPaginationTrait
{
    public function paginateResponse($paginator, $resource = null)
    {
        return [
            'data' => $resource ?? $paginator->items(),
            'meta' => [
                'current_page'   => $paginator->currentPage(),
                'per_page'       => $paginator->perPage(),
                'total'          => $paginator->total(),
                'last_page'      => $paginator->lastPage(),
                'next_page_url'  => $paginator->nextPageUrl(),
                'prev_page_url'  => $paginator->previousPageUrl(),
            ],
        ];
    }
}

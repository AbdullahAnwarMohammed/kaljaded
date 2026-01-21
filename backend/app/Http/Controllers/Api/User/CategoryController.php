<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\User\Category\CategoryResource;
use App\Http\Resources\Api\User\Product\ProductResource;

use App\Models\Category;
use App\Models\Product;
use App\Models\SubCategory;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponseTrait;
    public function all(Request $request)
    {
        $categories = Category::all();
        return $this->successResponse(CategoryResource::collection($categories), "messages.successfully");
    }

    public function CategoryWithProduct(Request $request)
    {
        $categories = Category::with([
            'products' => function ($q) {
                $q->where(function ($subQ) {
                    $subQ->where('fast_by', '!=', 1)
                         ->orWhereNull('fast_by');
                })->orderBy('id', 'desc')->limit(5);
            }
        ])
            ->has('products')
            ->get();

        return $this->successResponse(
            $categories->map(function ($cat) {
                return [
                    'category' => new CategoryResource($cat),
                    'products' => ProductResource::collection($cat->products)
                ];
            })
        );
    }
    public function getBySlug(Request $request, $slug = null)
    {
        $category = ($slug && $slug !== 'all')
            ? Category::with('subcategories')->where('slug', $slug)->first()
            : null;

        if ($slug && $slug !== 'all' && ! $category) {
            return $this->errorResponse('products.not_found', 404);
        }

        $productsQuery = Product::query()
            ->where(function($q) {
                  $q->where('fast_by', '!=', 1)
                    ->orWhereNull('fast_by');
            });

        if ($category) {
            $productsQuery->where('category_id', $category->id);
        }

        // لو فيه subcategory
        if ($subSlug = $request->query('sub')) {
            $subcategory = SubCategory::where('slug', $subSlug)->first();
            if ($subcategory) {
                $productsQuery->where('sub_category_id', $subcategory->id);
            }
        }

        if ($search = $request->query('search')) {
            $productsQuery->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('nameen', 'LIKE', "%{$search}%");
            });
        }

        $products = $productsQuery->orderBy('id', 'desc')->paginate(10);

        return $this->successResponse([
            'category' => $category ? new CategoryResource($category) : null,
            'products' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function getBySlugActivePrice(Request $request, $slug = null)
    {
        $category = ($slug && $slug !== 'all')
            ? Category::with('subcategories')->where('slug', $slug)->first()
            : null;

        if ($slug && $slug !== 'all' && ! $category) {
            return $this->errorResponse('products.not_found', 404);
        }

        $productsQuery = Product::query();

        // شرط price_active = 1
        $productsQuery->where('price_active', 1)
                      ->where(function($q) {
                          $q->where('fast_by', '!=', 1)
                            ->orWhereNull('fast_by');
                      });

        if ($category) {
            $productsQuery->where('category_id', $category->id);
        }

        // لو فيه subcategory
        if ($subSlug = $request->query('sub')) {
            $subcategory = SubCategory::where('slug', $subSlug)->first();
            if ($subcategory) {
                $productsQuery->where('sub_category_id', $subcategory->id);
            }
        }

        if ($search = $request->query('search')) {
            $productsQuery->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('nameen', 'LIKE', "%{$search}%");
            });
        }

        $products = $productsQuery->orderBy('id', 'desc')->paginate(10);

        return $this->successResponse([
            'category' => $category ? new CategoryResource($category) : null,
            'products' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }
}

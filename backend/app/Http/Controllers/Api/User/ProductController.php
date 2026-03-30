<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\User\Category\CategoryResource;
use App\Http\Resources\Api\User\Product\ProductResource;
use App\Http\Resources\Api\User\SubCategory\SubCategoryResource;
use App\Http\Resources\Api\User\SubSubCategory\SubSubCategoryResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\SubCategory;
use App\Models\SubSubCategory;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    use ApiResponseTrait;
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 25);
        $search = $request->query('search');

        $query = Product::with(['category', 'subcategory', 'subsubcategory', 'merchant'])
            ->where(function($q) {
                  $q->where('fast_by', '!=', 1)
                    ->orWhereNull('fast_by');
            })
            ->orderBy('id', 'desc');

        if ($search) {
            $query->where('name', 'LIKE', "%{$search}%")
                ->orWhere('nameen', 'LIKE', "%{$search}%");
        }

        if ($condition = $request->query('condition')) {
            if ($condition === 'new') {
                $query->where('product_active_new', 1);
            } elseif ($condition === 'used') {
                $query->where('product_active_new', 0);
            }
        }

        $products = $query->paginate($perPage);

        return $this->successResponse([
            'products' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ], 'messages.products_list');
    }

    public function showBySlug(string $slug)
    {
        $product = Product::with(['category', 'subcategory', 'subsubcategory', 'merchant'])
            ->where('slug', $slug)
            ->first();

        if (!$product) {
            return $this->errorResponse('messages.product_not_found', 404);
        }

        $this->recordView($product);

        $similarProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('isactive', 1)
            ->limit(10)
            ->get();

        return $this->successResponse([
            'product' => new ProductResource($product),
            'similar_products' => ProductResource::collection($similarProducts),
        ], 'messages.product_details');
    }

    public function show($id)
    {
        $product = Product::with(['category', 'subcategory', 'subsubcategory', 'merchant'])->find($id);

        if (!$product) {
            return $this->errorResponse('messages.product_not_found', 404);
        }

        $this->recordView($product);

        $similarProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('isactive', 1)
            ->limit(10)
            ->get();

        return $this->successResponse([
            'product' => new ProductResource($product),
            'similar_products' => ProductResource::collection($similarProducts),
        ], 'messages.product_details');
    }

    public function latest(Request $request)
    {
        $perPage = $request->query('per_page', 25);
        $search = $request->query('search');

        $query = Product::with(['category', 'subcategory', 'subsubcategory', 'merchant'])
            ->where(function ($q) {
                $q->where('fast_by', '!=', 1)
                    ->orWhereNull('fast_by');
            })
            ->where('isactive', 1)
            ->orderBy('id', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('nameen', 'LIKE', "%{$search}%");
            });
        }

        if ($condition = $request->query('condition')) {
            if ($condition === 'new') {
                $query->where('product_active_new', 1);
            } elseif ($condition === 'used') {
                $query->where('product_active_new', 0);
            }
        }

        $products = $query->paginate($perPage);

        return $this->successResponse([
            'category' => ['name' => 'احدث المتوفر'],
            'products' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ], 'messages.successfully');
    }

    private function recordView($product)
    {
        $userId = auth()->guard('sanctum')->id();
        $ip = request()->ip();

        // Check if this IP has already viewed this product
        $existingView = $product->views()
            ->where('ip_address', $ip)
            ->first();

        if ($existingView) {
            // If we now have a user_id but the existing record didn't, update it
            if ($userId && !$existingView->user_id) {
                $existingView->update(['user_id' => $userId]);
            }
        } else {
            // New view from this IP
            // Increment public view counter
            $product->increment('view');

            // Log the view
            $product->views()->create([
                'ip_address' => $ip,
                'user_id' => $userId,
            ]);
        }
    }

    public function search(Request $request)
    {
        $perPage = $request->get('per_page', 10);
        $query = $request->get('q');

        $products = Product::with(['category', 'subcategory', 'subsubcategory', 'merchant'])
            ->when($query, function ($q) use ($query) {
                $q->where(function ($queryBuilder) use ($query) {
                    $queryBuilder->where('name', 'LIKE', "%$query%")
                        ->orWhere('description', 'LIKE', "%$query%");
                });
            })
            ->where(function ($q) {
                $q->where('fast_by', '!=', 1)
                    ->orWhereNull('fast_by');
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        // Wrap the paginated data properly in a resource collection
        return $this->successResponse(
            ProductResource::collection($products)->response()->getData(true),
            'products.fetched_successfully'
        );
    }

    public function installments(Request $request, $slug = null)
    {
        $category = $slug ? Category::where('slug', $slug)->first() : null;
        $subcategory = $slug ? SubCategory::where('slug', $slug)->first() : null;
        $subsubcategory = $slug ? SubSubCategory::where('slug', $slug)->first() : null;

        // لو slug موجود ومفيش أي تصنيف مطابق
        if ($slug && ! $category && ! $subcategory && ! $subsubcategory) {
            return $this->errorResponse('products.not_found', 404);
        }
        $search = $request->query('search');
        $productsQuery = Product::with(['category', 'subcategory', 'subsubcategory', 'merchant'])
            ->where('price_active', 1);
        if ($category) {
            $productsQuery->where('category_id', $category->id);
        }
        if ($subcategory) {
            $productsQuery->where('sub_category_id', $subcategory->id);
        }
        if ($subsubcategory) {
            $productsQuery->where('sub_sub_category_id', $subsubcategory->id);
        }
        if ($search) {
            $productsQuery->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('nameen', 'LIKE', "%{$search}%");
            });
        }

        if ($condition = $request->query('condition')) {
            if ($condition === 'new') {
                $productsQuery->where('product_active_new', 1);
            } elseif ($condition === 'used') {
                $productsQuery->where('product_active_new', 0);
            }
        }
        $products = $productsQuery->paginate(25);
        return $this->successResponse([
            'category' => $category ? new CategoryResource($category) : null,
            'subcategory' => $subcategory ? new SubCategoryResource($subcategory) : null,
            'subsubcategory' => $subsubcategory ? new SubSubCategoryResource($subsubcategory) : null,
            'products' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ], 'installment_products_fetched');
    }
}

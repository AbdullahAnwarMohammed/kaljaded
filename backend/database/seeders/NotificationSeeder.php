<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\Review;
use App\Models\Notification;
use App\Models\User;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::all();

    foreach ($orders as $order) {
        $buyerId  = $order->userid;
        $sellerId = $order->iduserinsert;
        $orderId  = $order->id;

        $buyer = User::find($buyerId);
        $merchant = User::find($sellerId);

        if (!$buyer || !$merchant) {
            continue;
        }

        $merchantName = $merchant->name_vendor ?: ($merchant->name ?: 'متجر');

        // ✅ التحقق: هل قيم المستخدم هذا المتجر مسبقاً في أي طلب؟
        $hasRatedThisMerchant = Review::where('merchant_id', $sellerId)
                                     ->where('user_id', $buyerId)
                                     ->exists();

        if (!$hasRatedThisMerchant) {
            // ✅ استخدام مفتاح فريد (المستخدم + المتجر + نوع الإجراء)
            // هذا يضمن وجود إشعار واحد فقط لكل متجر لدى المستخدم
            Notification::updateOrCreate(
                [
                    'user_id' => $buyerId,
                    'type' => 'system',
                    'data->merchant_id' => $sellerId,
                    'data->action' => 'rate_seller'
                ],
                [
                    'title' => '📝 قيم تجربة الشراء',
                    'title_en' => 'Rate your purchase experience',
                    'message' => "لقد أكملت طلبك بنجاح من متجر ({$merchantName})! نرجو منك تقييم تجربة شرائك لمساعدتنا في تحسين الخدمة.",
                    'message_en' => "You have successfully completed your purchase from ({$merchantName})! Please rate your experience to help us improve.",
                    'data' => [
                        'order_id' => $orderId, 
                        'merchant_id' => $sellerId,
                        'merchant_name' => $merchantName,
                        'action' => 'rate_seller'
                    ],
                ]
            );
        }
    }
    }
}

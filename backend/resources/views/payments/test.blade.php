<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <title>Deema Test Payment</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-5">

            <div class="card shadow">
                <div class="card-body">
                    <h4 class="mb-4 text-center">الدفع عبر Deema</h4>

                    <form action="{{ route('deema.checkout') }}" method="POST">
                        @csrf

                        <div class="mb-3">
                            <label class="form-label">المبلغ</label>
                            <input type="number" name="amount" class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">العملة</label>
                            <select name="currency_code" class="form-select">
                                <option value="KWD">KWD</option>
                            </select>
                        </div>

                        <input type="hidden" name="order_id" value="{{ uniqid('order_') }}">

                        <button class="btn btn-primary w-100">
                            متابعة الدفع
                        </button>
                    </form>

                </div>
            </div>

        </div>
    </div>
</div>

</body>
</html>

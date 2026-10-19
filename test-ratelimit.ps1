$body = '{"customerName":"Test User","phone":"01012345678","email":"test@example.com","address":"123 Test Street","city":"Cairo","items":[{"productId":"prod-round-neck","productName":"Heavyweight Crewneck","size":"L","color":"Black","quantity":1,"unitPrice":849,"totalPrice":849}]}'

for ($i = 1; $i -le 7; $i++) {
    try {
        $response = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/orders" -Headers @{"Content-Type"="application/json"} -Body $body
        $msg = "Request " + $i + ": SUCCESS - Order: " + $response.orderNumber
        Write-Host $msg
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        $msg = "Request " + $i + ": ERROR - Status: " + $status + " Body: " + $errBody
        Write-Host $msg
    }
}
$body = '{"customerName":"Test User","phone":"01012345678","email":"test@example.com","address":"123 Test Street","city":"Cairo","items":[{"productId":"prod-round-neck","productName":"Heavyweight Crewneck","size":"L","color":"Black","quantity":1,"unitPrice":849,"totalPrice":849}]}'

try {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/orders" -Headers @{"Content-Type"="application/json"} -Body $body
    Write-Host "SUCCESS:" $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "ERROR STATUS:" $_.Exception.Response.StatusCode.value__
    if ($_.Exception.Response -ne $null) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "ERROR BODY:" $responseBody
    }
}
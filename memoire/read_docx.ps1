$w = New-Object -ComObject Word.Application
$w.Visible = $false
$d = $w.Documents.Open("C:\Users\User\OneDrive\Documents\GitHub\Stag.io\Canevas de memoire L3 TI.docx")
$d.Content.Text | Out-File -FilePath "C:\Users\User\OneDrive\Documents\GitHub\Stag.io\memoire\canevas_content.txt" -Encoding utf8
$d.Close($false)
$w.Quit()

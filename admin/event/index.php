<?php
require "../../handlers/loginer/index.php";

if (!$sessionStatus) {
    header("Location: ../../login/");
    exit;
}

if ($userRank == "user" || $userRank != "admin") {
    header("Location: ../../login/error?error=403");
}  
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin panel | event</title>
    <link rel="stylesheet" href="../../css/admin/event/index.css">
    <link rel="stylesheet" href="../../css/header.css">
</head>
<body>
    <form id="eventForm" method="post" enctype="multipart/form-data">
        <p>Добавление мероприятия</p>
        <div class="form--event">
            <div class="form--event--data">
                <label for="">Название мероприятия *</label>
                <input type="text" name="eventName" id="eventName" placeholder="Название" maxlength="128" required>
            </div>

            <div class="form--event--data">
                <label for="">Описание мероприятия</label>
                <input type="text" name="eventDesc" id="eventDesc" placeholder="Описание" maxlength="128">
            </div>

            <div class="form--event--data">
                <label for="">Локация мероприятия *</label>
                <input type="text" name="eventLocation" id="eventLocation" placeholder="Локация" maxlength="128" required>
            </div>

            <div class="form--event--data">
                <label for="">Дата проведения мероприятия *</label>
                <input type="text" name="eventData" id="eventData" placeholder="Дата (например: 15 декабря 2024)" maxlength="128" required>
            </div>

            <div class="form--event--data">
                <label for="">Ссылка на основной источник мероприятия *</label>
                <input type="text" name="eventLink" id="eventLink" placeholder="Ссылка" maxlength="128" required>
            </div>

            <div class="form--event--data">
                <label for="eventImage">Изображение мероприятия *</label>
                <input type="file" name="eventImage" id="eventImage" accept="image/*" required>
            </div>

            <div class="form--event--data">
                <label>Предпросмотр изображения</label>
                <div class="image-preview">
                    <img id="imagePreview" src="" alt="Предпросмотр" style="max-width: 300px; max-height: 200px; display: none;">
                    <p id="noImageText" style="color: #999;">Изображение не выбрано</p>
                </div>
            </div>

            <div id="messageContainer" style="display: none;"></div>

            <button type="submit" id="submitBtn">Добавить</button>
        </div>
    </form>

    <script>
        document.getElementById('eventImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            const preview = document.getElementById('imagePreview');
            const noImageText = document.getElementById('noImageText');
            
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    noImageText.style.display = 'none';
                }
                
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
                noImageText.style.display = 'block';
            }
        });

        document.querySelectorAll('input[required]').forEach(input => {
            const label = input.closest('.form--event--data').querySelector('label');
            if (label && !label.textContent.includes('*')) {
                label.innerHTML += ' *';
            }
        });

        document.getElementById('eventForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.textContent;
            const formData = new FormData(this);
            const messageContainer = document.getElementById('messageContainer');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Добавление...';
            submitBtn.classList.add('loading');
            
            messageContainer.style.display = 'none';
            messageContainer.innerHTML = '';
            messageContainer.className = '';
            
            try {
                const response = await fetch('../../handlers/admin/event/index.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    messageContainer.style.display = 'block';
                    messageContainer.innerHTML = `
                        <div style="background-color: #d4edda; color: #155724; padding: 10px; border-radius: 4px; border: 1px solid #c3e6cb;">
                            ✅ ${result.message}
                        </div>
                    `;
                    
                    setTimeout(() => {
                        document.getElementById('eventForm').reset();
                        document.getElementById('imagePreview').style.display = 'none';
                        document.getElementById('noImageText').style.display = 'block';
                        messageContainer.style.display = 'none';
                    }, 2000);
                    
                } else {
                    messageContainer.style.display = 'block';
                    messageContainer.innerHTML = `
                        <div style="background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; border: 1px solid #f5c6cb;">
                            ❌ ${result.message}
                        </div>
                    `;
                }
                
            } catch (error) {
                console.error('Ошибка:', error);
                messageContainer.style.display = 'block';
                messageContainer.innerHTML = `
                    <div style="background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; border: 1px solid #f5c6cb;">
                        ❌ Ошибка соединения с сервером
                    </div>
                `;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.classList.remove('loading');
            }
        });

        document.getElementById('resetBtn').addEventListener('click', function() {
            document.getElementById('eventForm').reset();
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('noImageText').style.display = 'block';
            document.getElementById('messageContainer').style.display = 'none';
        });
    </script>
</body>
</html>
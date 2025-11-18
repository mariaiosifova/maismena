// Открытие модального окна
document.addEventListener('DOMContentLoaded', function() {
  const registerBtn = document.getElementById('registerBtn'); // ваша кнопка регистрации
  const modal = document.getElementById('registrationModal');
  const closeBtn = document.querySelector('.close');
  const registrationForm = document.getElementById('registrationForm');

  // Открытие модального окна
  registerBtn.addEventListener('click', function() {
    modal.style.display = 'block';
  });

  // Закрытие модального окна
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  // Закрытие при клике вне окна
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Обработка формы регистрации
// Открытие модального окна
document.addEventListener('DOMContentLoaded', function() {
  const registerBtn = document.getElementById('registerBtn'); // ваша кнопка регистрации
  const modal = document.getElementById('registrationModal');
  const closeBtn = document.querySelector('.close');
  const registrationForm = document.getElementById('registrationForm');

  // Открытие модального окна
  registerBtn.addEventListener('click', function() {
    modal.style.display = 'block';
  });

  // Закрытие модального окна
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  // Закрытие при клике вне окна
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Обработка формы регистрации
  registrationForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Сохраняем в локальное хранилище
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Проверяем, нет ли уже такого пользователя
    if (users.find(user => user.username === username)) {
      alert('Пользователь с таким логином уже существует!');
      return;
    }

    // Добавляем нового пользователя
    users.push({
      username: username,
      password: password, // В реальном приложении пароль нужно хэшировать!
      registeredAt: new Date().toISOString()
    });

    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Регистрация успешна!');
    modal.style.display = 'none';
    registrationForm.reset();
  });
});
});
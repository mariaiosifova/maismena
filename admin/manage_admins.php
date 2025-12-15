<?php
require_once '../config/database.php';
require_once 'auth_functions.php';

checkAdminAuth();

if (!canManageAdmins()) {
    header('Location: index.php?access_denied=1');
    exit;
}

$admins_stmt = $main_pdo->query("SELECT * FROM admin_users ORDER BY created_at DESC");
$admins = $admins_stmt->fetchAll();

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'add_admin') {
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        $role = $_POST['role'] ?? 'admin';

        if (empty($username) || empty($password)) {
            $error = "Заполните все обязательные поля";
        } elseif (strlen($password) < 8) {
            $error = "Пароль должен быть не менее 8 символов";
        } else {
            $check_stmt = $main_pdo->prepare("SELECT id FROM admin_users WHERE username = ?");
            $check_stmt->execute([$username]);

            if ($check_stmt->rowCount() > 0) {
                $error = "Имя пользователя уже занято";
            } else {
                $password_hash = password_hash($password, PASSWORD_DEFAULT);

                $stmt = $main_pdo->prepare("
                    INSERT INTO admin_users (username, password_hash, role, is_active) 
                    VALUES (?, ?, ?, 1)
                ");

                try {
                    if ($stmt->execute([$username, $password_hash, $role])) {
                        $success = "Администратор успешно добавлен";
                        unset($_POST);
                    } else {
                        $error = "Ошибка при добавлении администратора";
                    }
                } catch (PDOException $e) {
                    $error = "Ошибка базы данных: " . $e->getMessage();
                }
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Управление администраторами</title>
    <link rel="stylesheet" href="../css/admin/index.css">
</head>

<body>
    <div class="body">
        <div class="body--header">
            <div class="header">
                <div class="header--nav">
                    <ul>
                        <li><a href="index.php">Главная</a></li>
                        <li><a href="manage_admins.php" class="active">Администраторы</a></li>
                        <li><a href="logout.php">Выйти</a></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="body--content">
            <div class="content--header">
                <p>Управление администраторами</p>
            </div>

            <div class="admin-container">
                <?php if (isset($_GET['success'])): ?>
                    <div class="message success">
                        <?php echo htmlspecialchars($_GET['success']); ?>
                    </div>
                <?php endif; ?>

                <?php if (isset($error)): ?>
                    <div class="message error">
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>

                <div class="admin-tables">
                    <div class="add-form">
                        <h3>Добавить нового администратора</h3>
                        <form method="POST" action="">
                            <input type="hidden" name="action" value="add_admin">

                            <div class="form-group">
                                <label for="user_id">Пользователь</label>
                                <select id="user_id" name="user_id" required>
                                    <option value="">-- Выберите пользователя --</option>
                                    <?php foreach ($users as $user): ?>
                                        <option value="<?php echo $user['id']; ?>">
                                            #<?php echo $user['id']; ?> -
                                            <?php echo htmlspecialchars($user['first_name'] . ' ' . $user['last_name']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="username">Имя администратора</label>
                                <input type="text" id="username" name="username" required
                                    placeholder="Введите уникальное имя администратора">
                            </div>

                            <div class="form-group">
                                <label for="password">Пароль</label>
                                <input type="password" id="password" name="password" required
                                    placeholder="Введите пароль" minlength="8">
                                <small style="color: #666; font-size: 12px;">
                                    Минимум 8 символов
                                </small>
                            </div>

                            <div class="form-group">
                                <label for="role">Роль</label>
                                <select id="role" name="role" required>
                                    <option value="admin">Администратор</option>
                                    <option value="moderator">Модератор</option>
                                    <option value="super_admin">Супер-администратор</option>
                                </select>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="save-btn">Добавить администратора</button>
                            </div>
                        </form>
                    </div>

                    <div class="table-wrapper" style="margin-top: 30px;">
                        <h3 style="margin-bottom: 20px; color: #333;">Список администраторов</h3>

                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Имя админа</th>
                                    <th>Пользователь</th>
                                    <th>Последний вход</th>
                                    <th>Статус</th>
                                    <th>Создан</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($admins as $admin): ?>
                                    <tr>
                                        <td><?php echo $admin['id']; ?></td>
                                        <td>
                                            <strong><?php echo htmlspecialchars($admin['username']); ?></strong>
                                        </td>
                                        <td>
                                            <span class="role-badge 
                                            <?php echo $admin['role'] === 'super_admin' ? 'super-admin' : ($admin['role'] === 'admin' ? 'admin' : 'moderator'); ?>">
                                                <?php
                                                $roles = [
                                                    'super_admin' => 'Супер-админ',
                                                    'admin' => 'Администратор',
                                                    'moderator' => 'Модератор'
                                                ];
                                                echo $roles[$admin['role']] ?? $admin['role'];
                                                ?>
                                            </span>
                                        </td>
                                        <td>
                                            <?php echo $admin['last_login'] ?
                                                date('d.m.Y H:i', strtotime($admin['last_login'])) :
                                                'Никогда'; ?>
                                        </td>
                                        <td>
                                            <span class="status-badge <?php echo $admin['is_active'] ? 'active' : 'inactive'; ?>">
                                                <?php echo $admin['is_active'] ? 'Активен' : 'Неактивен'; ?>
                                            </span>
                                        </td>
                                        <td><?php echo date('d.m.Y', strtotime($admin['created_at'])); ?></td>
                                        <td class="actions">
                                            <?php if ($admin['id'] != $_SESSION['admin_id']): ?>
                                                <button class="edit-btn" onclick="editAdmin(<?php echo $admin['id']; ?>)">
                                                    Изменить
                                                </button>
                                                <button class="delete-btn"
                                                    onclick="confirmDeleteAdmin(<?php echo $admin['id']; ?>)">
                                                    Удалить
                                                </button>
                                            <?php else: ?>
                                                <span style="color: #666; font-size: 12px;">Текущий пользователь</span>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function editAdmin(id) {
            alert('Редактирование администратора #' + id + ' (функция в разработке)');
        }

        function confirmDeleteAdmin(id) {
            if (confirm('Вы уверены, что хотите удалить этого администратора?\nЭто действие нельзя отменить.')) {
                window.location.href = 'delete_admin.php?id=' + id;
            }
        }

        const style = document.createElement('style');
        style.textContent = `
            .role-badge {
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .role-badge.super-admin {
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                color: white;
            }
            
            .role-badge.admin {
                background: linear-gradient(135deg, #2099fc, #0d8bf2);
                color: white;
            }
            
            .role-badge.moderator {
                background: linear-gradient(135deg, #2ed573, #25c464);
                color: white;
            }
            
            .status-badge {
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .status-badge.active {
                background: rgba(46, 213, 115, 0.1);
                color: #2ed573;
                border: 1px solid #2ed573;
            }
            
            .status-badge.inactive {
                background: rgba(255, 71, 87, 0.1);
                color: #ff4757;
                border: 1px solid #ff4757;
            }
        `;
        document.head.appendChild(style);
    </script>
</body>

</html>
<?php
require_once 'auth_functions.php';

$admin = checkAdminAuth();

require_once '../config/database.php';

if (!isset($main_pdo) || !($main_pdo instanceof PDO)) {
    die("Ошибка: Не удалось подключиться к базе данных");
}

$canAdd = canAddRecords();
$canDelete = canDeleteRecords();
$canEdit = canEditRecords();

$action = $_GET['action'] ?? '';
$table = $_GET['table'] ?? '';
$id = $_GET['id'] ?? 0;
$message = '';
$message_type = '';

if ($action === 'delete' && $table && $id) {
    if (!$canDelete) {
        $message = 'У вас нет прав для удаления записей';
        $message_type = 'error';
    } else {
        try {
            $stmt = $main_pdo->query("SHOW TABLES LIKE '$table'");
            if ($stmt->rowCount() > 0) {
                $sql = "DELETE FROM `$table` WHERE id = ?";
                $stmt = $main_pdo->prepare($sql);
                $stmt->execute([$id]);
                $message = 'Запись успешно удалена';
                $message_type = 'success';
            }
        } catch (PDOException $e) {
            $message = 'Ошибка при удалении: ' . $e->getMessage();
            $message_type = 'error';
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add') {
    $table = $_POST['table'] ?? '';
    if ($table) {
        if (!$canAdd) {
            $message = 'У вас нет прав для добавления записей';
            $message_type = 'error';
        } else {
            try {
                $stmt = $main_pdo->query("DESCRIBE `$table`");
                $columns = $stmt->fetchAll();

                $fields = [];
                $values = [];
                $placeholders = [];

                foreach ($columns as $column) {
                    $field = $column['Field'];
                    if ($field === 'id' || strpos($column['Extra'], 'auto_increment') !== false) {
                        continue;
                    }

                    if ($column['Default'] === 'CURRENT_TIMESTAMP') {
                        continue;
                    }

                    if (isset($_POST[$field])) {
                        $fields[] = $field;
                        $values[] = $_POST[$field];
                        $placeholders[] = '?';
                    }
                }

                if (!empty($fields)) {
                    $sql = "INSERT INTO `$table` (" . implode(', ', $fields) . ") 
                            VALUES (" . implode(', ', $placeholders) . ")";
                    $stmt = $main_pdo->prepare($sql);
                    $stmt->execute($values);

                    $message = 'Запись успешно добавлена';
                    $message_type = 'success';
                }
            } catch (PDOException $e) {
                $message = 'Ошибка при добавлении: ' . $e->getMessage();
                $message_type = 'error';
            }
        }
    }
}

try {
    $tables_stmt = $main_pdo->query("SHOW TABLES");
    $all_tables = $tables_stmt->fetchAll(PDO::FETCH_COLUMN);
} catch (PDOException $e) {
    die("Ошибка при получении списка таблиц: " . $e->getMessage());
}

$current_table = $_GET['table'] ?? ($all_tables[0] ?? '');
$table_data = [];
$table_structure = [];

if ($current_table) {
    try {
        $structure_stmt = $main_pdo->query("DESCRIBE `$current_table`");
        $table_structure = $structure_stmt->fetchAll();
 
        $data_stmt = $main_pdo->query("SELECT * FROM `$current_table`");
        $table_data = $data_stmt->fetchAll();
    } catch (PDOException $e) {
        $message = 'Ошибка при загрузке таблицы: ' . $e->getMessage();
        $message_type = 'error';
    }
}
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админ-панель</title>
    <link rel="stylesheet" href="../css/admin/index.css">
    <style>
        .actions {
            display: flex;
            gap: 5px;
        }

        .actions button {
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }

        .actions .edit-btn {
            background: #4CAF50;
            color: white;
        }

        .actions .delete-btn {
            background: #f44336;
            color: white;
        }
        
        .role-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            margin-left: 8px;
            vertical-align: middle;
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
        
        .permission-hint {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
            font-style: italic;
        }
        
        .no-permission {
            opacity: 0.6;
            cursor: not-allowed;
        }
    </style>
</head>

<body>
    <div class="body">
        <div class="body--header">
            <div class="header">
                <div class="header--image">
                </div>
                <div class="header--nav">
                    <ul>
                        <li><a href="index.php">Главная</a></li>
                        <?php if (hasAdminRole('admin')): ?>
                            <li><a href="index.php?table=users">Пользователи</a></li>
                        <?php endif; ?>
                        <?php if (canManageAdmins()): ?>
                            <li><a href="manage_admins.php">Администраторы</a></li>
                        <?php endif; ?>
                        <li><a href="logout.php">Выйти</a></li>
                    </ul>
                </div>
                <div class="header--nb">
                    <button onclick="toggleMenu()">☰</button>
                </div>
            </div>
        </div>

        <div class="body--content">
            <div class="content--header">
                <p>Административная панель</p>
            </div>

            <div class="admin-container">
                <?php if ($message): ?>
                    <div class="message <?php echo $message_type; ?>">
                        <?php echo htmlspecialchars($message); ?>
                    </div>
                <?php endif; ?>

                <div class="admin-header">
                    <h1>Управление базой данных</h1>
                    <div class="admin-info">
                        <div class="user-info">
                            Вы вошли как:
                            <strong><?php echo htmlspecialchars($_SESSION['admin_username']); ?></strong>
                            <span class="role-badge <?php echo htmlspecialchars($_SESSION['admin_role'] ?? ''); ?>">
                                <?php 
                                $roles_names = [
                                    'super_admin' => 'Супер-админ',
                                    'admin' => 'Администратор',
                                    'moderator' => 'Модератор'
                                ];
                                echo $roles_names[$_SESSION['admin_role']] ?? $_SESSION['admin_role'];
                                ?>
                            </span>
                        </div>
                        <a href="logout.php" class="logout-btn">Выйти</a>
                    </div>
                </div>

                <div class="admin-tables">
                    <div class="tabs">
                        <?php foreach ($all_tables as $table_name): ?>
                            <button class="tab-btn <?php echo ($table_name === $current_table) ? 'active' : ''; ?>"
                                onclick="location.href='index.php?table=<?php echo urlencode($table_name); ?>'">
                                <?php echo htmlspecialchars($table_name); ?>
                            </button>
                        <?php endforeach; ?>
                    </div>

                    <div class="tab-content active">
                        <?php if ($current_table): ?>
                            <div class="table-actions">
                                <h2 class="table-title">Таблица: <?php echo htmlspecialchars($current_table); ?></h2>
                                <div class="actions-buttons">
                                    <button class="refresh-btn" onclick="location.reload()">
                                        <span>⟳</span> Обновить
                                    </button>
                                    <?php if ($canAdd): ?>
                                        <button class="add-btn" onclick="showAddForm()">
                                            <span>+</span> Добавить запись
                                        </button>
                                    <?php else: ?>
                                        <button class="add-btn no-permission" disabled title="Модераторы не могут добавлять записи">
                                            <span>+</span> Добавить запись
                                        </button>
                                    <?php endif; ?>
                                </div>
                                <?php if (!$canAdd || !$canDelete): ?>
                                    <div class="permission-hint">
                                        <?php if (!$canAdd && !$canDelete): ?>
                                            🔒 Модераторы могут только просматривать данные
                                        <?php elseif (!$canAdd): ?>
                                            🔒 Модераторы не могут добавлять записи
                                        <?php elseif (!$canDelete): ?>
                                            🔒 Модераторы не могут удалять записи
                                        <?php endif; ?>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <div class="table-info">
                                <h4>Структура таблицы:</h4>
                                <div class="info-grid">
                                    <?php foreach ($table_structure as $column): ?>
                                        <div class="info-item">
                                            <strong><?php echo htmlspecialchars($column['Field']); ?>:</strong>
                                            <?php echo htmlspecialchars($column['Type']); ?>
                                            <?php echo ($column['Key'] === 'PRI') ? '(Primary Key)' : ''; ?>
                                            <?php echo ($column['Null'] === 'NO') ? 'NOT NULL' : 'NULL'; ?>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>

                            <div class="table-wrapper">
                                <?php if (!empty($table_data)): ?>
                                    <table class="data-table">
                                        <thead>
                                            <tr>
                                                <?php foreach (array_keys($table_data[0]) as $column): ?>
                                                    <th><?php echo htmlspecialchars($column); ?></th>
                                                <?php endforeach; ?>
                                                <?php if ($canEdit || $canDelete): ?>
                                                    <th>Действия</th>
                                                <?php endif; ?>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($table_data as $row): ?>
                                                <tr>
                                                    <?php foreach ($row as $value): ?>
                                                        <td><?php echo htmlspecialchars($value ?? ''); ?></td>
                                                    <?php endforeach; ?>
                                                    <?php if ($canEdit || $canDelete): ?>
                                                        <td class="actions">
                                                            <?php if ($canEdit): ?>
                                                                <button class="edit-btn" onclick="editRecord(<?php echo $row['id'] ?? 0; ?>)">
                                                                    Изменить
                                                                </button>
                                                            <?php endif; ?>
                                                            <?php if ($canDelete): ?>
                                                                <button class="delete-btn"
                                                                    onclick="confirmDelete('<?php echo $current_table; ?>', <?php echo $row['id'] ?? 0; ?>)">
                                                                    Удалить
                                                                </button>
                                                            <?php endif; ?>
                                                        </td>
                                                    <?php endif; ?>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                <?php else: ?>
                                    <div class="no-data">
                                        <p>В таблице нет данных</p>
                                    </div>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <?php if ($canAdd && $current_table): ?>
    <div id="addModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Добавить запись в таблицу: <?php echo htmlspecialchars($current_table); ?></h3>
                <button class="close-modal" onclick="hideAddForm()">×</button>
            </div>
            <form method="POST" action="">
                <div class="modal-body">
                    <input type="hidden" name="action" value="add">
                    <input type="hidden" name="table" value="<?php echo htmlspecialchars($current_table); ?>">

                    <?php foreach ($table_structure as $column):
                        $field = $column['Field'];
                        if ($field === 'id' || strpos($column['Extra'], 'auto_increment') !== false) {
                            continue;
                        }
                    ?>
                        <div class="form-group">
                            <label for="field_<?php echo $field; ?>">
                                <?php echo htmlspecialchars($field); ?>
                                <?php if ($column['Null'] === 'NO' && is_null($column['Default'])): ?>
                                    <span style="color: red">*</span>
                                <?php endif; ?>
                            </label>

                            <?php if (strpos($column['Type'], 'enum') !== false):
                                preg_match("/enum\('(.+)'\)/", $column['Type'], $matches);
                                $enum_values = explode("','", $matches[1] ?? '');
                            ?>
                                <select id="field_<?php echo $field; ?>" name="<?php echo $field; ?>"
                                    <?php echo ($column['Null'] === 'NO') ? 'required' : ''; ?>>
                                    <option value="">-- Выберите --</option>
                                    <?php foreach ($enum_values as $value): ?>
                                        <option value="<?php echo htmlspecialchars($value); ?>">
                                            <?php echo htmlspecialchars($value); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>

                            <?php elseif (
                                strpos($column['Type'], 'int') !== false ||
                                strpos($column['Type'], 'decimal') !== false ||
                                strpos($column['Type'], 'float') !== false
                            ): ?>
                                <input type="number" id="field_<?php echo $field; ?>"
                                    name="<?php echo $field; ?>"
                                    <?php echo ($column['Null'] === 'NO') ? 'required' : ''; ?>
                                    placeholder="Введите число">

                            <?php elseif (strpos($column['Type'], 'date') !== false): ?>
                                <input type="date" id="field_<?php echo $field; ?>"
                                    name="<?php echo $field; ?>"
                                    <?php echo ($column['Null'] === 'NO') ? 'required' : ''; ?>>

                            <?php elseif (strpos($column['Type'], 'time') !== false): ?>
                                <input type="time" id="field_<?php echo $field; ?>"
                                    name="<?php echo $field; ?>"
                                    <?php echo ($column['Null'] === 'NO') ? 'required' : ''; ?>>

                            <?php elseif (
                                strpos($column['Type'], 'datetime') !== false ||
                                strpos($column['Type'], 'timestamp') !== false
                            ): ?>
                                <input type="datetime-local" id="field_<?php echo $field; ?>"
                                    name="<?php echo $field; ?>"
                                    <?php echo ($column['Null'] === 'NO') ? 'required' : ''; ?>>

                            <?php elseif (
                                strpos($column['Type'], 'text') !== false ||
                                strpos($column['Type'], 'longtext') !== false
                            ): ?>
                                <textarea id="field_<?php echo $field; ?>"
                                    name="<?php echo $field; ?>"
                                    rows="4"
                                    <?php echo ($column['Null'] === 'NO') ? 'required' : ''; ?>
                                    placeholder="Введите текст"></textarea>

                            <?php else: ?>
                                <input type="text" id="field_<?php echo $field; ?>"
                                    name="<?php echo $field; ?>"
                                    <?php echo ($column['Null'] === 'NO') ? 'required' : ''; ?>
                                    placeholder="Введите значение">
                            <?php endif; ?>

                            <small style="color: #666; font-size: 12px; display: block; margin-top: 5px;">
                                Тип: <?php echo htmlspecialchars($column['Type']); ?>
                                <?php if ($column['Default']): ?>
                                    | По умолчанию: <?php echo htmlspecialchars($column['Default']); ?>
                                <?php endif; ?>
                            </small>
                        </div>
                    <?php endforeach; ?>
                </div>
                <div class="modal-footer">
                    <button type="button" class="cancel-btn" onclick="hideAddForm()">Отмена</button>
                    <button type="submit" class="confirm-btn save-btn">Сохранить</button>
                </div>
            </form>
        </div>
    </div>
    <?php endif; ?>

    <?php if ($canDelete): ?>
    <div id="deleteModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Подтверждение удаления</h3>
                <button class="close-modal" onclick="hideDeleteModal()">×</button>
            </div>
            <div class="modal-body">
                <p class="confirm-text">Вы уверены, что хотите удалить эту запись?</p>
                <p class="confirm-text" style="color: #ff4757; font-weight: bold;">
                    Это действие нельзя отменить!
                </p>
            </div>
            <div class="modal-footer">
                <button type="button" class="cancel-btn" onclick="hideDeleteModal()">Отмена</button>
                <button type="button" class="confirm-btn" onclick="performDelete()">Удалить</button>
            </div>
        </div>
    </div>
    <?php endif; ?>

    <script>
        let currentTable = '';
        let recordId = 0;

        function toggleMenu() {
            const menu = document.querySelector('.menu');
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
        }

        function showAddForm() {
            document.getElementById('addModal').classList.add('active');
        }

        function hideAddForm() {
            document.getElementById('addModal').classList.remove('active');
        }

        function editRecord(id) {
            alert('Редактирование записи #' + id + ' (функция в разработке)');
        }

        function confirmDelete(table, id) {
            currentTable = table;
            recordId = id;
            document.getElementById('deleteModal').classList.add('active');
        }

        function hideDeleteModal() {
            document.getElementById('deleteModal').classList.remove('active');
        }

        function performDelete() {
            if (currentTable && recordId) {
                window.location.href = `index.php?action=delete&table=${currentTable}&id=${recordId}`;
            }
        }

        window.addEventListener('click', function(event) {
            const addModal = document.getElementById('addModal');
            const deleteModal = document.getElementById('deleteModal');

            if (addModal && event.target === addModal) {
                hideAddForm();
            }
            if (deleteModal && event.target === deleteModal) {
                hideDeleteModal();
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                hideAddForm();
                hideDeleteModal();
            }
        });
    </script>
</body>

</html>
const db = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function migrateHotelsTable() {
   
    try {
        // 1. D'abord, ajoutez la colonne user_id sans la contrainte NOT NULL
        const addColumnSQL = `
            ALTER TABLE hotels 
            ADD COLUMN user_id INT,
            ADD INDEX idx_user_id (user_id)
        `;
        await db.execute(addColumnSQL);
        console.log('Colonne user_id ajoutée avec succès');

        // 2. Récupérez tous les hôtels qui n'ont pas encore de user_id
        const [hotels] = await db.execute('SELECT id, email FROM hotels WHERE user_id IS NULL');
        
        // 3. Pour chaque hôtel, trouvez l'utilisateur correspondant par email
        for (const hotel of hotels) {
            try {
                // Recherchez l'utilisateur par email
                const [users] = await db.execute(
                    'SELECT id FROM users WHERE email = ?',
                    [hotel.email]
                );

                if (users && users.length > 0) {
                    // Mise à jour de l'hôtel avec l'ID de l'utilisateur trouvé
                    await db.execute(
                        'UPDATE hotels SET user_id = ? WHERE id = ?',
                        [users[0].id, hotel.id]
                    );
                    console.log(`Hôtel ${hotel.id} mis à jour avec user_id ${users[0].id}`);
                } else {
                    // Si aucun utilisateur n'est trouvé, vous pouvez soit :
                    // Option 1 : Créer un utilisateur par défaut
                    const [result] = await db.execute(
                        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                        [
                            `user_${hotel.email.split('@')[0]}`,
                            hotel.email,
                            // Générez un mot de passe aléatoire ou utilisez une valeur par défaut
                            await bcrypt.hash('ChangeMe123!', 10)
                        ]
                    );
                    await db.execute(
                        'UPDATE hotels SET user_id = ? WHERE id = ?',
                        [result.insertId, hotel.id]
                    );
                    console.log(`Nouvel utilisateur créé et hôtel ${hotel.id} mis à jour`);
                }
            } catch (error) {
                console.error(`Erreur lors du traitement de l'hôtel ${hotel.id}:`, error);
            }
        }

        // 4. Vérifiez que tous les hôtels ont un user_id
        const [nullChecks] = await db.execute('SELECT COUNT(*) as count FROM hotels WHERE user_id IS NULL');
        
        if (nullChecks[0].count === 0) {
            // 5. Ajoutez la contrainte NOT NULL et la clé étrangère
            const addConstraintsSQL = `
                ALTER TABLE hotels 
                MODIFY COLUMN user_id INT NOT NULL,
                ADD CONSTRAINT fk_user_hotels 
                FOREIGN KEY (user_id) REFERENCES users(id)
            `;
            await db.execute(addConstraintsSQL);
            console.log('Migration terminée avec succès');
        } else {
            throw new Error(`Il reste ${nullChecks[0].count} hôtels sans user_id`);
        }

    } catch (error) {
        console.error('Erreur lors de la migration:', error);
        // Script de rollback si nécessaire
        try {
            await db.execute('ALTER TABLE hotels DROP COLUMN user_id');
            console.log('Rollback effectué');
        } catch (rollbackError) {
            console.error('Erreur lors du rollback:', rollbackError);
        }
    }
}

// Fonction pour exécuter la migration de manière sécurisée
async function executeMigration() {
    try {
        await migrateHotelsTable();
        console.log('Migration terminée avec succès');
        process.exit(0);
    } catch (error) {
        console.error('Échec de la migration:', error);
        process.exit(1);
    }
}

// Exécuter la migration
executeMigration();
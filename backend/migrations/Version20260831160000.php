<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Table de réglages clé/valeur (première utilisation : affichage du chatbot).
 */
final class Version20260831160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajout de la table setting (réglages du site)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE IF NOT EXISTS setting (name VARCHAR(100) NOT NULL, value VARCHAR(500) NOT NULL, PRIMARY KEY (name)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql("INSERT IGNORE INTO setting (name, value) VALUES ('chatbot_enabled', '1')");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE setting');
    }
}

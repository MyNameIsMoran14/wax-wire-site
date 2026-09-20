<?php

declare(strict_types=1);

namespace App\Core;

use PDO;

// Тонкая обёртка над PDO: избавляет модели от ручных SQL-строк, но внутри —
// обычные prepared statements, никакой магии/рефлексии.
class QueryBuilder
{
    private array $wheres = [];
    private array $bindings = [];
    private ?string $orderColumn = null;
    private string $orderDirection = 'ASC';
    private ?int $limitCount = null;

    public function __construct(
        private readonly PDO $pdo,
        private readonly string $table,
    ) {
    }

    public function where(string $column, mixed $value): static
    {
        $this->wheres[] = "$column = ?";
        $this->bindings[] = $value;
        return $this;
    }

    public function orderBy(string $column, string $direction = 'asc'): static
    {
        $this->orderColumn = $column;
        $this->orderDirection = strtolower($direction) === 'desc' ? 'DESC' : 'ASC';
        return $this;
    }

    public function limit(int $count): static
    {
        $this->limitCount = $count;
        return $this;
    }

    public function get(): array
    {
        $sql = "SELECT * FROM {$this->table}" . $this->buildWhereClause();
        if ($this->orderColumn !== null) {
            $sql .= " ORDER BY {$this->orderColumn} {$this->orderDirection}";
        }
        if ($this->limitCount !== null) {
            $sql .= " LIMIT {$this->limitCount}";
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($this->bindings);
        return $stmt->fetchAll();
    }

    public function first(): ?array
    {
        $this->limitCount = 1;
        $rows = $this->get();
        return $rows[0] ?? null;
    }

    public function count(): int
    {
        $sql = "SELECT COUNT(*) AS c FROM {$this->table}" . $this->buildWhereClause();
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($this->bindings);
        return (int) $stmt->fetch()['c'];
    }

    public function insert(array $data): int
    {
        $columns = array_keys($data);
        $placeholders = implode(', ', array_fill(0, count($columns), '?'));
        $sql = "INSERT INTO {$this->table} (" . implode(', ', $columns) . ") VALUES ($placeholders)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(array_values($data));
        return (int) $this->pdo->lastInsertId();
    }

    public function update(array $data): int
    {
        $set = implode(', ', array_map(static fn (string $col) => "$col = ?", array_keys($data)));
        $sql = "UPDATE {$this->table} SET $set" . $this->buildWhereClause();

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([...array_values($data), ...$this->bindings]);
        return $stmt->rowCount();
    }

    public function delete(): int
    {
        $sql = "DELETE FROM {$this->table}" . $this->buildWhereClause();
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($this->bindings);
        return $stmt->rowCount();
    }

    private function buildWhereClause(): string
    {
        return $this->wheres === [] ? '' : ' WHERE ' . implode(' AND ', $this->wheres);
    }
}

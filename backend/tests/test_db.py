import os
import pytest


def test_get_connection_returns_sqlite_without_postgres_url(monkeypatch):
    monkeypatch.delenv("POSTGRES_URL", raising=False)
    monkeypatch.setenv("DB_PATH", "/tmp/test_piaso.db")
    import importlib
    import backend.utils.db as db_module
    importlib.reload(db_module)
    conn, dialect = db_module.get_connection()
    assert dialect == "sqlite"
    conn.close()


def test_fetchall_returns_list_of_dicts(monkeypatch, tmp_path):
    monkeypatch.delenv("POSTGRES_URL", raising=False)
    db_file = str(tmp_path / "test.db")
    monkeypatch.setenv("DB_PATH", db_file)

    import sqlite3
    import importlib
    import backend.utils.db as db_module
    importlib.reload(db_module)

    # Seed a table
    conn = sqlite3.connect(db_file)
    conn.execute("CREATE TABLE test_items (id INTEGER PRIMARY KEY, name TEXT)")
    conn.execute("INSERT INTO test_items (name) VALUES (?)", ("hello",))
    conn.commit()
    conn.close()

    rows = db_module.fetchall(None, "SELECT * FROM test_items WHERE name = ?", ("hello",))
    assert len(rows) == 1
    assert rows[0]["name"] == "hello"


def test_execute_inserts_row(monkeypatch, tmp_path):
    monkeypatch.delenv("POSTGRES_URL", raising=False)
    db_file = str(tmp_path / "test2.db")
    monkeypatch.setenv("DB_PATH", db_file)

    import sqlite3
    import importlib
    import backend.utils.db as db_module
    importlib.reload(db_module)

    conn = sqlite3.connect(db_file)
    conn.execute("CREATE TABLE things (id INTEGER PRIMARY KEY, val TEXT)")
    conn.commit()
    conn.close()

    db_module.execute("INSERT INTO things (val) VALUES (?)", ("world",))

    conn = sqlite3.connect(db_file)
    row = conn.execute("SELECT val FROM things").fetchone()
    conn.close()
    assert row[0] == "world"

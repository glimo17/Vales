-- ========================================
-- Script completo para SQL Server
-- ========================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PrestamosDB')
BEGIN
    CREATE DATABASE PrestamosDB;
END
GO

USE PrestamosDB;
GO

-- =====================
-- Tabla de Prestamos (primero por llaves foraneas)
-- =====================
IF OBJECT_ID('prestamos', 'U') IS NOT NULL DROP TABLE prestamos;
GO

-- =====================
-- Tabla de Usuarios
-- =====================
IF OBJECT_ID('usuarios', 'U') IS NOT NULL DROP TABLE usuarios;
GO

CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(100) NOT NULL,
    rol NVARCHAR(10) CHECK(rol IN ('mamá','yo')) NOT NULL
);
GO

INSERT INTO usuarios (nombre, rol) VALUES ('Mamá', 'mamá'), ('Yo', 'yo');
GO

-- =====================
-- Tabla de Tipos de Prestamo
-- =====================
IF OBJECT_ID('tipos_prestamo', 'U') IS NOT NULL DROP TABLE tipos_prestamo;
GO

CREATE TABLE tipos_prestamo (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(50) NOT NULL
);
GO

INSERT INTO tipos_prestamo (nombre) VALUES
('Dinero'),
('Cigarros'),
('Golosinas'),
('Otro');
GO

-- =====================
-- Tabla de Prestamos
-- =====================
CREATE TABLE prestamos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    descripcion NVARCHAR(255),
    monto DECIMAL(18,2) NULL,
    tipo_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY(tipo_id) REFERENCES tipos_prestamo(id)
);
GO

INSERT INTO prestamos (usuario_id, descripcion, monto, tipo_id) VALUES
(1, 'Compra de golosinas', NULL, 3),
(1, 'Prestamo de dinero para transporte', 5000, 1),
(1, 'Compra de cigarros', NULL, 2);
GO

--
-- PostgreSQL database dump
--

\restrict XLSJo2LsEcyZZH9wM9FFfraKbR2pHxPwpgbnDgukJRY4Gzh4iZhilNysqPmTC4S

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('bafb64ce-6ce9-4a9e-87f7-77c1da5e474b', 'd93d1f4089dc31d8a03abba39dd45717a63b327c05989b50cf2afbaf31e492de', '2026-09-11 05:06:00.233759+00', '20260911050600_init', NULL, NULL, '2026-09-11 05:06:00.088177+00', 1);


--
-- Data for Name: rol; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.rol (id_rol, nombre_rol) VALUES (1, 'Administrador');
INSERT INTO public.rol (id_rol, nombre_rol) VALUES (2, 'Asesor');
INSERT INTO public.rol (id_rol, nombre_rol) VALUES (3, 'Super Administrador');


--
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usuario (id_usuario, primer_nombre, primer_apellido, tipo_documento, numero_documento, correo, contrasena, estado, requiere_cambio_contrasena, id_rol) VALUES (3, 'Super', 'Admin', 'Cédula de ciudadanía', '1033704652', 'superadmin@pronavid.com', '$2b$10$qe.o3pdq/5q2MKS8zLcuCOkpB7yUlueRbbrPJDjHrbvIUTPY5l2by', true, false, 3);
INSERT INTO public.usuario (id_usuario, primer_nombre, primer_apellido, tipo_documento, numero_documento, correo, contrasena, estado, requiere_cambio_contrasena, id_rol) VALUES (4, 'Asesor', 'A', 'Cédula de ciudadanía', '1031421234', 'asesor@pronavid.com', '$2b$10$QpUdSgVB0zVD1poybJwIteOfHTHwWlCsAaUtAuKOmYqZae/ZWoCpy', true, true, 2);
INSERT INTO public.usuario (id_usuario, primer_nombre, primer_apellido, tipo_documento, numero_documento, correo, contrasena, estado, requiere_cambio_contrasena, id_rol) VALUES (5, 'Admin', 'A', 'Cédula de ciudadanía', '79810475', 'admin@pronavid.com', '$2b$10$8i4K7SFY/5iGz9IiJSBSI.1qeVLRUkBQV/ro/kOvXvjhhl2GBf5xO', true, true, 1);
INSERT INTO public.usuario (id_usuario, primer_nombre, primer_apellido, tipo_documento, numero_documento, correo, contrasena, estado, requiere_cambio_contrasena, id_rol) VALUES (6, 'Laura', 'Gómez', 'Cédula de ciudadanía', '1000000001', 'asesor1@pronavid.com', '$2b$10$8PG7kHHricVpFg3vGz7rO.B5QzmPboSIWH4mP0Ek2KZVi9efphY4.', true, false, 2);
INSERT INTO public.usuario (id_usuario, primer_nombre, primer_apellido, tipo_documento, numero_documento, correo, contrasena, estado, requiere_cambio_contrasena, id_rol) VALUES (7, 'Carlos', 'Restrepo', 'Cédula de ciudadanía', '1000000002', 'asesor2@pronavid.com', '$2b$10$8PG7kHHricVpFg3vGz7rO.B5QzmPboSIWH4mP0Ek2KZVi9efphY4.', true, false, 2);
INSERT INTO public.usuario (id_usuario, primer_nombre, primer_apellido, tipo_documento, numero_documento, correo, contrasena, estado, requiere_cambio_contrasena, id_rol) VALUES (8, 'Andrea', 'Suárez', 'Cédula de ciudadanía', '1000000003', 'asesor3@pronavid.com', '$2b$10$8PG7kHHricVpFg3vGz7rO.B5QzmPboSIWH4mP0Ek2KZVi9efphY4.', true, false, 2);
INSERT INTO public.usuario (id_usuario, primer_nombre, primer_apellido, tipo_documento, numero_documento, correo, contrasena, estado, requiere_cambio_contrasena, id_rol) VALUES (9, 'Javier', 'Mendoza', 'Cédula de ciudadanía', '1000000004', 'admin1@pronavid.com', '$2b$10$8PG7kHHricVpFg3vGz7rO.B5QzmPboSIWH4mP0Ek2KZVi9efphY4.', true, false, 1);
INSERT INTO public.usuario (id_usuario, primer_nombre, primer_apellido, tipo_documento, numero_documento, correo, contrasena, estado, requiere_cambio_contrasena, id_rol) VALUES (10, 'Diana', 'Pérez', 'Cédula de ciudadanía', '1000000005', 'admin2@pronavid.com', '$2b$10$8PG7kHHricVpFg3vGz7rO.B5QzmPboSIWH4mP0Ek2KZVi9efphY4.', true, false, 1);
INSERT INTO public.usuario (id_usuario, primer_nombre, primer_apellido, tipo_documento, numero_documento, correo, contrasena, estado, requiere_cambio_contrasena, id_rol) VALUES (1, 'Alexxx', 'Merchan', 'Cédula de ciudadanía', '1033704653', 'alexan321kass@gmail.com', '$2b$10$D93SsA7XrYyhfS0zB8VdT.5yw7zjZ1kAiucV22zJ2o71w02V0zwXG', false, false, 1);


--
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: categoria; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categoria (id_categoria, nombre_categoria, descripcion, estado, fecha_creacion, fecha_actualizacion) VALUES (1, 'Cereales', 'Rico', true, '2026-09-11 07:08:10.858', '2026-09-11 07:08:10.858');
INSERT INTO public.categoria (id_categoria, nombre_categoria, descripcion, estado, fecha_creacion, fecha_actualizacion) VALUES (2, 'Panaderia', 'pan', true, '2026-09-11 07:08:20.845', '2026-09-11 07:08:20.845');
INSERT INTO public.categoria (id_categoria, nombre_categoria, descripcion, estado, fecha_creacion, fecha_actualizacion) VALUES (3, 'Frutos secos', 'a', true, '2026-09-11 07:08:46.055', '2026-09-11 07:08:46.055');
INSERT INTO public.categoria (id_categoria, nombre_categoria, descripcion, estado, fecha_creacion, fecha_actualizacion) VALUES (4, 'Galletas', 'a', true, '2026-09-11 07:09:04.37', '2026-09-11 07:09:04.37');
INSERT INTO public.categoria (id_categoria, nombre_categoria, descripcion, estado, fecha_creacion, fecha_actualizacion) VALUES (5, 'Dulces', '', true, '2026-09-11 07:09:37.39', '2026-09-11 07:09:37.39');


--
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (6, 'Supermercados Éxito', '900123456', 'compras@exito.com.co', '018000112233', 'Cra 48 # 32B Sur-139');
INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (7, 'Tiendas D1', '900987654', 'proveedores@tiendasd1.com', '3124567890', 'Calle 100 # 15-20');
INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (8, 'Supertiendas Olímpica', '890104536', 'contacto@olimpica.com', '018000511511', 'Calle 53 # 46-192');
INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (9, 'Carulla FreshMarket', '860000000', 'gerencia@carulla.com', '3157891234', 'Carrera 11 # 85-30');
INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (10, 'Makro Supermayorista', '830009876', 'mayoristas@makro.com.co', '3208889977', 'Autopista Norte # 197-02');
INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (11, 'Surtimax', '901222333', 'pedidos@surtimax.com', '3114445566', 'Avenida Caracas # 45-12');
INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (4, 'Merka 1', '1050607080', 'ana.martinez@example.com', '3156667788', 'Transversal 30 # 20-10');
INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (3, 'D-TODOS', '1040506070', 'carlos.rodriguez@example.com', '3205554433', 'Avenida 68 # 90-12');
INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (1, 'Don Pan', '1020304050', 'juan.perez@example.com', '3001234567', 'Calle 123 # 45-67');
INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (5, 'Super-Market', '1060708090', 'luis.torres@example.com', '3112223344', 'Diagonal 15 # 8-42');
INSERT INTO public.cliente (id_cliente, nombre_cliente, identificacion, correo_cliente, telefono_cliente, direccion_cliente) VALUES (2, 'Las palmas', '1030405060', 'maria.gomez@example.com', '3109876543', 'Carrera 45 # 12-34');


--
-- Data for Name: cotizacion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (1, 'CER-001', 'Cereal Multigrano', 'Mezcla de 5 granos con vitaminas y minerales', 6000.000000000000000000000000000000, 100, NULL, NULL, true, 1);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (3, 'CER-003', 'Granola con Frutos Rojos', 'Granola artesanal con arándanos y fresas deshidratadas', 7500.000000000000000000000000000000, 80, NULL, NULL, true, 1);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (4, 'GAL-001', 'Galleta de Avena y Miel', 'Galleta crujiente de avena con miel natural', 2500.000000000000000000000000000000, 150, NULL, NULL, true, 4);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (5, 'GAL-002', 'Galleta Chocolate Chip', 'Galleta con chispas de chocolate premium', 2800.000000000000000000000000000000, 200, NULL, NULL, true, 4);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (6, 'GAL-003', 'Galleta de Vainilla', 'Galleta suave con sabor a vainilla natural', 2200.000000000000000000000000000000, 180, NULL, NULL, true, 4);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (7, 'PAN-001', 'Pan Integral con Semillas', 'Pan integral con semillas de linaza y chía', 3800.000000000000000000000000000000, 250, NULL, NULL, true, 2);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (8, 'PAN-002', 'Mini Croissant Mantequilla', 'Croissant artesanal con mantequilla europea', 4200.000000000000000000000000000000, 100, NULL, NULL, true, 2);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (9, 'PAN-003', 'Pan de Queso Doble Crema', 'Panecillo relleno de queso doble crema, paquete x6', 5500.000000000000000000000000000000, 200, NULL, NULL, true, 2);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (10, 'FRU-001', 'Mix de Nueces Premium', 'Mezcla de almendras, nueces y marañones tostados', 12000.000000000000000000000000000000, 60, NULL, NULL, true, 3);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (11, 'FRU-002', 'Maní Salado Tostado', 'Maní crocante tostado con sal del Himalaya, 500g', 5500.000000000000000000000000000000, 150, NULL, NULL, true, 3);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (12, 'FRU-003', 'Pasas y Arándanos', 'Mezcla de pasas y arándanos deshidratados naturales', 8000.000000000000000000000000000000, 90, NULL, NULL, true, 3);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (13, 'GAL-004', 'Galleta de Avena y Miel', 'Galleta crujiente de avena con miel natural', 2500.000000000000000000000000000000, 150, NULL, NULL, true, 4);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (14, 'GAL-005', 'Galleta Chocolate Chip', 'Galleta con chispas de chocolate premium', 2800.000000000000000000000000000000, 200, NULL, NULL, true, 4);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (15, 'GAL-006', 'Galleta de Vainilla', 'Galleta suave con sabor a vainilla natural', 2200.000000000000000000000000000000, 180, NULL, NULL, true, 4);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (16, 'DUL-001', 'Turrón de Maní', 'Turrón crujiente con maní tostado y miel', 3500.000000000000000000000000000000, 130, NULL, NULL, true, 5);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (17, 'DUL-002', 'Bocadillo Veleño', 'Bocadillo tradicional de guayaba con panela', 4000.000000000000000000000000000000, 110, NULL, NULL, true, 5);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (18, 'DUL-003', 'Arequipe Artesanal', 'Arequipe cremoso elaborado con leche de finca, 250g', 6500.000000000000000000000000000000, 70, NULL, NULL, true, 5);
INSERT INTO public.producto (id_producto, codigo_interno, nombre_producto, descripcion, precio, stock, imagen_url, imagen_public_id, estado, id_categoria) VALUES (2, 'CER-002', 'Avena Instantánea', 'Hojuelas de avena precocida lista en 3 minutos', 4500.000000000000000000000000000000, 120, 'https://res.cloudinary.com/ia4jsfn3/image/upload/v1789114606/productos/fvomhzcvqjwrxshnv8yb.png', 'productos/fvomhzcvqjwrxshnv8yb', true, 1);


--
-- Data for Name: detalle_cotizacion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: pedido; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: venta; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: devolucion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: detalle_devolucion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: detalle_venta; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: movimiento_inventario; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: notificacion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: permiso; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: permiso_rol; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: auditoria_id_auditoria_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auditoria_id_auditoria_seq', 1, false);


--
-- Name: categoria_id_categoria_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categoria_id_categoria_seq', 5, true);


--
-- Name: cliente_id_cliente_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cliente_id_cliente_seq', 11, true);


--
-- Name: cotizacion_id_cotizacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cotizacion_id_cotizacion_seq', 1, false);


--
-- Name: detalle_cotizacion_id_detalle_cotizacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.detalle_cotizacion_id_detalle_cotizacion_seq', 1, false);


--
-- Name: detalle_devolucion_id_detalle_devolucion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.detalle_devolucion_id_detalle_devolucion_seq', 1, false);


--
-- Name: detalle_venta_id_detalle_venta_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.detalle_venta_id_detalle_venta_seq', 1, false);


--
-- Name: devolucion_id_devolucion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.devolucion_id_devolucion_seq', 1, false);


--
-- Name: movimiento_inventario_id_movimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.movimiento_inventario_id_movimiento_seq', 1, false);


--
-- Name: notificacion_id_notificacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notificacion_id_notificacion_seq', 1, false);


--
-- Name: pedido_id_pedido_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedido_id_pedido_seq', 1, false);


--
-- Name: permiso_id_permiso_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permiso_id_permiso_seq', 1, false);


--
-- Name: producto_id_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.producto_id_producto_seq', 18, true);


--
-- Name: rol_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rol_id_rol_seq', 2, true);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuario_id_usuario_seq', 10, true);


--
-- Name: venta_id_venta_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.venta_id_venta_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict XLSJo2LsEcyZZH9wM9FFfraKbR2pHxPwpgbnDgukJRY4Gzh4iZhilNysqPmTC4S


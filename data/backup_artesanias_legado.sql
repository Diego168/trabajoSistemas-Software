BEGIN TRANSACTION;
CREATE TABLE proveedor (
    id_proveedor    INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    contacto        VARCHAR(60),
    tipo_insumo     VARCHAR(40)
);
INSERT INTO "proveedor" VALUES(1,'Arcillas Andes S.A.C.','925 427 614','Arcilla');
INSERT INTO "proveedor" VALUES(2,'Maderas Cusco E.I.R.L.','975 762 980','Madera');
INSERT INTO "proveedor" VALUES(3,'Hilos y Fibras Sol S.R.L.','923 328 715','Lana/Hilo');
INSERT INTO "proveedor" VALUES(4,'Pigmentos Valle S.A.C.','989 669 530','Pigmentos');
INSERT INTO "proveedor" VALUES(5,'Barnices Inca E.I.R.L.','983 660 962','Barniz y lacas');
INSERT INTO "proveedor" VALUES(6,'Herramientas Quinua S.R.L.','972 869 891','Herramientas');
INSERT INTO "proveedor" VALUES(7,'Esmaltes Titicaca S.A.C.','985 551 345','Esmaltes');
INSERT INTO "proveedor" VALUES(8,'Tintes Pacha E.I.R.L.','910 728 182','Tintes naturales');
INSERT INTO "proveedor" VALUES(9,'Herrajes Wayra S.R.L.','924 394 936','Herrajes');
INSERT INTO "proveedor" VALUES(10,'Embalajes Illari S.A.C.','922 560 111','Embalaje');
INSERT INTO "proveedor" VALUES(11,'Arcillas Cusco E.I.R.L.','997 602 795','Arcilla');
INSERT INTO "proveedor" VALUES(12,'Maderas Sol S.R.L.','950 315 506','Madera');
INSERT INTO "proveedor" VALUES(13,'Hilos y Fibras Valle S.A.C.','942 456 465','Lana/Hilo');
INSERT INTO "proveedor" VALUES(14,'Pigmentos Inca E.I.R.L.','958 863 625','Pigmentos');
INSERT INTO "proveedor" VALUES(15,'Barnices Quinua S.R.L.','991 178 840','Barniz y lacas');
INSERT INTO "proveedor" VALUES(16,'Herramientas Titicaca S.A.C.','953 191 670','Herramientas');
INSERT INTO "proveedor" VALUES(17,'Esmaltes Pacha E.I.R.L.','978 399 394','Esmaltes');
INSERT INTO "proveedor" VALUES(18,'Tintes Wayra S.R.L.','968 244 997','Tintes naturales');
INSERT INTO "proveedor" VALUES(19,'Herrajes Illari S.A.C.','992 820 833','Herrajes');
INSERT INTO "proveedor" VALUES(20,'Embalajes Andes E.I.R.L.','983 416 125','Embalaje');
INSERT INTO "proveedor" VALUES(21,'Arcillas Sol S.R.L.','957 472 572','Arcilla');
INSERT INTO "proveedor" VALUES(22,'Maderas Valle S.A.C.','964 192 508','Madera');
INSERT INTO "proveedor" VALUES(23,'Hilos y Fibras Inca E.I.R.L.','984 667 610','Lana/Hilo');
INSERT INTO "proveedor" VALUES(24,'Pigmentos Quinua S.R.L.','924 535 618','Pigmentos');
INSERT INTO "proveedor" VALUES(25,'Barnices Titicaca S.A.C.','986 996 602','Barniz y lacas');
INSERT INTO "proveedor" VALUES(26,'Herramientas Pacha E.I.R.L.','960 637 364','Herramientas');
INSERT INTO "proveedor" VALUES(27,'Esmaltes Wayra S.R.L.','963 677 590','Esmaltes');
INSERT INTO "proveedor" VALUES(28,'Tintes Illari S.A.C.','975 630 924','Tintes naturales');
INSERT INTO "proveedor" VALUES(29,'Herrajes Andes E.I.R.L.','913 689 329','Herrajes');
INSERT INTO "proveedor" VALUES(30,'Embalajes Cusco S.R.L.','926 937 150','Embalaje');
INSERT INTO "proveedor" VALUES(31,'Arcillas Valle S.A.C.','976 786 205','Arcilla');
INSERT INTO "proveedor" VALUES(32,'Maderas Inca E.I.R.L.','989 539 581','Madera');
INSERT INTO "proveedor" VALUES(33,'Hilos y Fibras Quinua S.R.L.','928 593 334','Lana/Hilo');
INSERT INTO "proveedor" VALUES(34,'Pigmentos Titicaca S.A.C.','925 741 817','Pigmentos');
INSERT INTO "proveedor" VALUES(35,'Barnices Pacha E.I.R.L.','968 790 580','Barniz y lacas');
INSERT INTO "proveedor" VALUES(36,'Herramientas Wayra S.R.L.','979 357 673','Herramientas');
INSERT INTO "proveedor" VALUES(37,'Esmaltes Illari S.A.C.','961 785 415','Esmaltes');
INSERT INTO "proveedor" VALUES(38,'Tintes Andes E.I.R.L.','980 918 762','Tintes naturales');
INSERT INTO "proveedor" VALUES(39,'Herrajes Cusco S.R.L.','974 815 590','Herrajes');
INSERT INTO "proveedor" VALUES(40,'Embalajes Sol S.A.C.','961 543 307','Embalaje');
INSERT INTO "proveedor" VALUES(41,'Arcillas Inca E.I.R.L.','947 951 375','Arcilla');
INSERT INTO "proveedor" VALUES(42,'Maderas Quinua S.R.L.','911 133 253','Madera');
INSERT INTO "proveedor" VALUES(43,'Hilos y Fibras Titicaca S.A.C.','993 711 569','Lana/Hilo');
INSERT INTO "proveedor" VALUES(44,'Pigmentos Pacha E.I.R.L.','976 601 468','Pigmentos');
INSERT INTO "proveedor" VALUES(45,'Barnices Wayra S.R.L.','935 366 809','Barniz y lacas');
INSERT INTO "proveedor" VALUES(46,'Herramientas Illari S.A.C.','972 577 623','Herramientas');
INSERT INTO "proveedor" VALUES(47,'Esmaltes Andes E.I.R.L.','973 927 544','Esmaltes');
INSERT INTO "proveedor" VALUES(48,'Tintes Cusco S.R.L.','981 779 134','Tintes naturales');
INSERT INTO "proveedor" VALUES(49,'Herrajes Sol S.A.C.','947 424 568','Herrajes');
INSERT INTO "proveedor" VALUES(50,'Embalajes Valle E.I.R.L.','922 548 805','Embalaje');
CREATE TABLE taller (
    id_taller       INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          VARCHAR(80)  NOT NULL,
    tecnica         VARCHAR(40)  NOT NULL
);
INSERT INTO "taller" VALUES(1,'Taller de Cerámica','Alfarería y cerámica');
INSERT INTO "taller" VALUES(2,'Taller de Ebanistería','Tallado en madera');
INSERT INTO "taller" VALUES(3,'Taller de Tejidos','Hilados y tejidos');
CREATE TABLE artesano (
    id_artesano     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          VARCHAR(100) NOT NULL,
    especialidad    VARCHAR(60)  NOT NULL,
    id_taller       INTEGER      NOT NULL REFERENCES taller(id_taller)
);
INSERT INTO "artesano" VALUES(1,'Sofía Flores Choque','Ceramista',1);
INSERT INTO "artesano" VALUES(2,'Víctor Huanca Torres','Tallador',2);
INSERT INTO "artesano" VALUES(3,'Rosa Ramos Flores','Hilandera',3);
INSERT INTO "artesano" VALUES(4,'Mario Huamán Condori','Alfarera',1);
INSERT INTO "artesano" VALUES(5,'Víctor Mamani Choque','Ebanista',2);
INSERT INTO "artesano" VALUES(6,'Rosa Quispe Choque','Tejedora',3);
INSERT INTO "artesano" VALUES(7,'Néstor Callo Condori','Ceramista',1);
INSERT INTO "artesano" VALUES(8,'Juan Yupanqui Quispe','Tallador',2);
INSERT INTO "artesano" VALUES(9,'Mario Mamani Quispe','Hilandera',3);
INSERT INTO "artesano" VALUES(10,'Delia Yupanqui Callo','Alfarero',1);
INSERT INTO "artesano" VALUES(11,'Luz Apaza Condori','Tallador',2);
INSERT INTO "artesano" VALUES(12,'Delia Mamani Yupanqui','Hilandera',3);
INSERT INTO "artesano" VALUES(13,'Rosa Paucar Ramos','Ceramista',1);
INSERT INTO "artesano" VALUES(14,'Luz Callo Callo','Tallador',2);
INSERT INTO "artesano" VALUES(15,'Sofía Paucar Paucar','Tejedora',3);
INSERT INTO "artesano" VALUES(16,'Sofía Callo Condori','Alfarero',1);
INSERT INTO "artesano" VALUES(17,'María Huamán Paucar','Ebanista',2);
INSERT INTO "artesano" VALUES(18,'Pedro Huanca Ccori','Hilandera',3);
INSERT INTO "artesano" VALUES(19,'María Quispe Apaza','Alfarero',1);
INSERT INTO "artesano" VALUES(20,'Ana Ramos Flores','Tallador',2);
INSERT INTO "artesano" VALUES(21,'Ana Salas Huamán','Hilandera',3);
INSERT INTO "artesano" VALUES(22,'Carmen Yupanqui Yupanqui','Ceramista',1);
INSERT INTO "artesano" VALUES(23,'Luz Yupanqui Apaza','Ebanista',2);
INSERT INTO "artesano" VALUES(24,'Víctor Yupanqui Ccori','Hilandera',3);
INSERT INTO "artesano" VALUES(25,'Néstor Condori Ramos','Alfarera',1);
INSERT INTO "artesano" VALUES(26,'Rosa Apaza Paucar','Ebanista',2);
INSERT INTO "artesano" VALUES(27,'Elena Ramos Salas','Tejedora',3);
INSERT INTO "artesano" VALUES(28,'Pedro Ramos Apaza','Ceramista',1);
INSERT INTO "artesano" VALUES(29,'Carmen Huanca Callo','Ebanista',2);
INSERT INTO "artesano" VALUES(30,'Hugo Torres Ramos','Tejedora',3);
INSERT INTO "artesano" VALUES(31,'Luz Ramos Apaza','Ceramista',1);
INSERT INTO "artesano" VALUES(32,'Sofía Salas Mamani','Ebanista',2);
INSERT INTO "artesano" VALUES(33,'Carlos Paucar Flores','Hilandera',3);
INSERT INTO "artesano" VALUES(34,'Raúl Paucar Huanca','Ceramista',1);
INSERT INTO "artesano" VALUES(35,'Julia Flores Mamani','Tallador',2);
INSERT INTO "artesano" VALUES(36,'Carlos Flores Choque','Hilandera',3);
INSERT INTO "artesano" VALUES(37,'Víctor Flores Choque','Ceramista',1);
INSERT INTO "artesano" VALUES(38,'Ana Apaza Choque','Tallador',2);
INSERT INTO "artesano" VALUES(39,'Juan Apaza Callo','Hilandera',3);
INSERT INTO "artesano" VALUES(40,'Juan Huanca Condori','Ceramista',1);
INSERT INTO "artesano" VALUES(41,'María Huamán Salas','Tallador',2);
INSERT INTO "artesano" VALUES(42,'Ana Paucar Apaza','Tejedora',3);
INSERT INTO "artesano" VALUES(43,'María Ccori Huanca','Ceramista',1);
INSERT INTO "artesano" VALUES(44,'Mario Apaza Ramos','Ebanista',2);
INSERT INTO "artesano" VALUES(45,'Juan Yupanqui Torres','Hilandera',3);
INSERT INTO "artesano" VALUES(46,'Raúl Callo Yupanqui','Alfarera',1);
INSERT INTO "artesano" VALUES(47,'Elena Yupanqui Flores','Tallador',2);
INSERT INTO "artesano" VALUES(48,'Raúl Mamani Huamán','Hilandera',3);
INSERT INTO "artesano" VALUES(49,'Juan Paucar Mamani','Ceramista',1);
INSERT INTO "artesano" VALUES(50,'Pedro Callo Ccori','Ebanista',2);
INSERT INTO "artesano" VALUES(51,'Juan Apaza Ccori','Hilandera',3);
INSERT INTO "artesano" VALUES(52,'Delia Huanca Huamán','Alfarero',1);
INSERT INTO "artesano" VALUES(53,'Ana Mamani Flores','Tallador',2);
INSERT INTO "artesano" VALUES(54,'Rosa Quispe Paucar','Hilandera',3);
INSERT INTO "artesano" VALUES(55,'Víctor Quispe Quispe','Ceramista',1);
INSERT INTO "artesano" VALUES(56,'José Quispe Flores','Ebanista',2);
INSERT INTO "artesano" VALUES(57,'Juan Ramos Apaza','Hilandera',3);
INSERT INTO "artesano" VALUES(58,'Ana Callo Choque','Alfarera',1);
INSERT INTO "artesano" VALUES(59,'Néstor Quispe Salas','Tallador',2);
INSERT INTO "artesano" VALUES(60,'Ana Yupanqui Condori','Hilandera',3);
CREATE TABLE insumo (
    id_insumo       INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre          VARCHAR(100)  NOT NULL,
    categoria       VARCHAR(40)   NOT NULL,
    unidad          VARCHAR(20)   NOT NULL,
    stock           NUMERIC(10,2) NOT NULL DEFAULT 0,
    stock_minimo    NUMERIC(10,2) NOT NULL DEFAULT 0,
    id_taller       INTEGER       NOT NULL REFERENCES taller(id_taller),
    id_proveedor    INTEGER       REFERENCES proveedor(id_proveedor)
);
INSERT INTO "insumo" VALUES(1,'Esmalte transparente','Acabado','lt',9,40,1,NULL);
INSERT INTO "insumo" VALUES(2,'Barniz marino','Acabado','lt',117,30,2,22);
INSERT INTO "insumo" VALUES(3,'Tinte de cochinilla','Tinte','kg',65,20,3,3);
INSERT INTO "insumo" VALUES(4,'Esmalte transparente','Acabado','lt',28,10,1,37);
INSERT INTO "insumo" VALUES(5,'Barniz marino','Acabado','lt',5,20,2,22);
INSERT INTO "insumo" VALUES(6,'Tinte de cochinilla','Tinte','kg',94,20,3,3);
INSERT INTO "insumo" VALUES(7,'Óxido de hierro','Pigmento','kg',45,20,1,27);
INSERT INTO "insumo" VALUES(8,'Madera de cedro','Materia prima','pza',68,40,2,12);
INSERT INTO "insumo" VALUES(9,'Tinte de molle','Tinte','kg',3,10,3,3);
INSERT INTO "insumo" VALUES(10,'Arcilla blanca','Materia prima','kg',75,30,1,31);
INSERT INTO "insumo" VALUES(11,'Barniz marino','Acabado','lt',37,10,2,45);
INSERT INTO "insumo" VALUES(12,'Lana de oveja','Materia prima','kg',73,20,3,NULL);
INSERT INTO "insumo" VALUES(13,'Esmalte transparente','Acabado','lt',9,25,1,41);
INSERT INTO "insumo" VALUES(14,'Lija al agua','Herramienta','pza',96,40,2,12);
INSERT INTO "insumo" VALUES(15,'Lana de oveja','Materia prima','kg',33,30,3,43);
INSERT INTO "insumo" VALUES(16,'Óxido de hierro','Pigmento','kg',57,25,1,41);
INSERT INTO "insumo" VALUES(17,'Madera de tornillo','Materia prima','pza',2,15,2,2);
INSERT INTO "insumo" VALUES(18,'Hilo de algodón','Materia prima','kg',91,30,3,33);
INSERT INTO "insumo" VALUES(19,'Engobe','Acabado','lt',37,20,1,34);
INSERT INTO "insumo" VALUES(20,'Cera de abeja','Acabado','kg',21,10,2,42);
INSERT INTO "insumo" VALUES(21,'Lana de alpaca','Materia prima','kg',34,40,3,23);
INSERT INTO "insumo" VALUES(22,'Engobe','Acabado','lt',173,40,1,41);
INSERT INTO "insumo" VALUES(23,'Barniz marino','Acabado','lt',10,10,2,NULL);
INSERT INTO "insumo" VALUES(24,'Lana de oveja','Materia prima','kg',32,25,3,18);
INSERT INTO "insumo" VALUES(25,'Óxido de hierro','Pigmento','kg',13,15,1,47);
INSERT INTO "insumo" VALUES(26,'Lija al agua','Herramienta','pza',132,40,2,15);
INSERT INTO "insumo" VALUES(27,'Tinte de molle','Tinte','kg',63,20,3,18);
INSERT INTO "insumo" VALUES(28,'Engobe','Acabado','lt',78,20,1,34);
INSERT INTO "insumo" VALUES(29,'Lija al agua','Herramienta','pza',27,30,2,35);
INSERT INTO "insumo" VALUES(30,'Tinte de molle','Tinte','kg',44,20,3,13);
INSERT INTO "insumo" VALUES(31,'Esmalte transparente','Acabado','lt',46,15,1,47);
INSERT INTO "insumo" VALUES(32,'Madera de cedro','Materia prima','pza',86,20,2,32);
INSERT INTO "insumo" VALUES(33,'Lana de alpaca','Materia prima','kg',13,40,3,8);
INSERT INTO "insumo" VALUES(34,'Engobe','Acabado','lt',89,20,1,NULL);
INSERT INTO "insumo" VALUES(35,'Barniz marino','Acabado','lt',60,15,2,5);
INSERT INTO "insumo" VALUES(36,'Lana de alpaca','Materia prima','kg',57,30,3,48);
INSERT INTO "insumo" VALUES(37,'Engobe','Acabado','lt',3,30,1,21);
INSERT INTO "insumo" VALUES(38,'Lija al agua','Herramienta','pza',96,30,2,12);
INSERT INTO "insumo" VALUES(39,'Tinte de molle','Tinte','kg',15,10,3,13);
INSERT INTO "insumo" VALUES(40,'Esmalte transparente','Acabado','lt',90,20,1,14);
INSERT INTO "insumo" VALUES(41,'Barniz marino','Acabado','lt',5,10,2,12);
INSERT INTO "insumo" VALUES(42,'Hilo de algodón','Materia prima','kg',89,20,3,23);
INSERT INTO "insumo" VALUES(43,'Engobe','Acabado','lt',39,15,1,11);
INSERT INTO "insumo" VALUES(44,'Madera de cedro','Materia prima','pza',112,30,2,35);
INSERT INTO "insumo" VALUES(45,'Tinte de cochinilla','Tinte','kg',19,20,3,NULL);
INSERT INTO "insumo" VALUES(46,'Arcilla blanca','Materia prima','kg',172,40,1,1);
INSERT INTO "insumo" VALUES(47,'Madera de tornillo','Materia prima','pza',89,20,2,12);
INSERT INTO "insumo" VALUES(48,'Lana de oveja','Materia prima','kg',17,10,3,43);
INSERT INTO "insumo" VALUES(49,'Arcilla roja','Materia prima','kg',4,20,1,17);
INSERT INTO "insumo" VALUES(50,'Barniz marino','Acabado','lt',49,15,2,12);
INSERT INTO "insumo" VALUES(51,'Tinte de molle','Tinte','kg',61,30,3,13);
INSERT INTO "insumo" VALUES(52,'Arcilla roja','Materia prima','kg',82,20,1,4);
INSERT INTO "insumo" VALUES(53,'Madera de cedro','Materia prima','pza',10,25,2,45);
INSERT INTO "insumo" VALUES(54,'Hilo de algodón','Materia prima','kg',70,40,3,28);
INSERT INTO "insumo" VALUES(55,'Esmalte transparente','Acabado','lt',40,25,1,27);
INSERT INTO "insumo" VALUES(56,'Cera de abeja','Acabado','kg',68,15,2,NULL);
INSERT INTO "insumo" VALUES(57,'Hilo de algodón','Materia prima','kg',31,40,3,48);
INSERT INTO "insumo" VALUES(58,'Engobe','Acabado','lt',14,10,1,41);
INSERT INTO "insumo" VALUES(59,'Madera de cedro','Materia prima','pza',124,25,2,22);
INSERT INTO "insumo" VALUES(60,'Hilo de algodón','Materia prima','kg',97,40,3,13);
CREATE TABLE pieza (
    id_pieza        INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo          VARCHAR(20)   NOT NULL UNIQUE,
    nombre          VARCHAR(100)  NOT NULL,
    tecnica         VARCHAR(40)   NOT NULL,
    id_taller       INTEGER       NOT NULL REFERENCES taller(id_taller),
    precio          NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    estado          VARCHAR(20)   NOT NULL DEFAULT 'EN_PRODUCCION'
                    CHECK (estado IN ('EN_PRODUCCION','DISPONIBLE','VENDIDA'))
);
INSERT INTO "pieza" VALUES(1,'PZ-001','Espejo tallado Sol Andino','Ebanistería',2,330,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(2,'PZ-002','Bufanda Cóndor','Tejido',3,290,'VENDIDA');
INSERT INTO "pieza" VALUES(3,'PZ-003','Atril Quinua','Ebanistería',2,430,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(4,'PZ-004','Marco tallado Nazca','Ebanistería',2,600,'DISPONIBLE');
INSERT INTO "pieza" VALUES(5,'PZ-005','Marco tallado Colibrí','Ebanistería',2,420,'VENDIDA');
INSERT INTO "pieza" VALUES(6,'PZ-006','Banco tallado Quinua','Ebanistería',2,530,'VENDIDA');
INSERT INTO "pieza" VALUES(7,'PZ-007','Jarrón Colibrí','Cerámica',1,350,'DISPONIBLE');
INSERT INTO "pieza" VALUES(8,'PZ-008','Espejo tallado Pachamama','Ebanistería',2,450,'VENDIDA');
INSERT INTO "pieza" VALUES(9,'PZ-009','Puerta decorativa Ayni','Ebanistería',2,470,'DISPONIBLE');
INSERT INTO "pieza" VALUES(10,'PZ-010','Cofre Puma','Ebanistería',2,250,'DISPONIBLE');
INSERT INTO "pieza" VALUES(11,'PZ-011','Banco tallado Machu','Ebanistería',2,540,'VENDIDA');
INSERT INTO "pieza" VALUES(12,'PZ-012','Alfombra Titicaca','Tejido',3,340,'DISPONIBLE');
INSERT INTO "pieza" VALUES(13,'PZ-013','Puerta decorativa Inca','Ebanistería',2,540,'VENDIDA');
INSERT INTO "pieza" VALUES(14,'PZ-014','Alfombra Nazca','Tejido',3,460,'VENDIDA');
INSERT INTO "pieza" VALUES(15,'PZ-015','Atril Nazca','Ebanistería',2,450,'VENDIDA');
INSERT INTO "pieza" VALUES(16,'PZ-016','Jarrón Cóndor','Cerámica',1,230,'VENDIDA');
INSERT INTO "pieza" VALUES(17,'PZ-017','Puerta decorativa Cóndor','Ebanistería',2,460,'VENDIDA');
INSERT INTO "pieza" VALUES(18,'PZ-018','Poncho Puma','Tejido',3,280,'VENDIDA');
INSERT INTO "pieza" VALUES(19,'PZ-019','Tazón Pachamama','Cerámica',1,250,'VENDIDA');
INSERT INTO "pieza" VALUES(20,'PZ-020','Puerta decorativa Ayni','Ebanistería',2,550,'DISPONIBLE');
INSERT INTO "pieza" VALUES(21,'PZ-021','Fuente Pachamama','Cerámica',1,290,'VENDIDA');
INSERT INTO "pieza" VALUES(22,'PZ-022','Chullo Chakana','Tejido',3,500,'VENDIDA');
INSERT INTO "pieza" VALUES(23,'PZ-023','Manta Nazca','Tejido',3,400,'VENDIDA');
INSERT INTO "pieza" VALUES(24,'PZ-024','Alfombra Machu','Tejido',3,490,'VENDIDA');
INSERT INTO "pieza" VALUES(25,'PZ-025','Plato decorativo Puma','Cerámica',1,470,'VENDIDA');
INSERT INTO "pieza" VALUES(26,'PZ-026','Chalina Machu','Tejido',3,240,'VENDIDA');
INSERT INTO "pieza" VALUES(27,'PZ-027','Florero Ayni','Cerámica',1,480,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(28,'PZ-028','Florero Quinua','Cerámica',1,140,'DISPONIBLE');
INSERT INTO "pieza" VALUES(29,'PZ-029','Marco tallado Ayni','Ebanistería',2,330,'DISPONIBLE');
INSERT INTO "pieza" VALUES(30,'PZ-030','Cántaro Cóndor','Cerámica',1,340,'DISPONIBLE');
INSERT INTO "pieza" VALUES(31,'PZ-031','Tazón Chakana','Cerámica',1,230,'VENDIDA');
INSERT INTO "pieza" VALUES(32,'PZ-032','Poncho Titicaca','Tejido',3,260,'VENDIDA');
INSERT INTO "pieza" VALUES(33,'PZ-033','Chalina Mochica','Tejido',3,540,'DISPONIBLE');
INSERT INTO "pieza" VALUES(34,'PZ-034','Puerta decorativa Sol Andino','Ebanistería',2,410,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(35,'PZ-035','Fuente Nazca','Cerámica',1,460,'VENDIDA');
INSERT INTO "pieza" VALUES(36,'PZ-036','Tazón Quinua','Cerámica',1,380,'VENDIDA');
INSERT INTO "pieza" VALUES(37,'PZ-037','Cántaro Chakana','Cerámica',1,440,'VENDIDA');
INSERT INTO "pieza" VALUES(38,'PZ-038','Tazón Sol Andino','Cerámica',1,150,'VENDIDA');
INSERT INTO "pieza" VALUES(39,'PZ-039','Cántaro Puma','Cerámica',1,280,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(40,'PZ-040','Banco tallado Chakana','Ebanistería',2,540,'VENDIDA');
INSERT INTO "pieza" VALUES(41,'PZ-041','Florero Ayni','Cerámica',1,170,'VENDIDA');
INSERT INTO "pieza" VALUES(42,'PZ-042','Atril Mochica','Ebanistería',2,340,'DISPONIBLE');
INSERT INTO "pieza" VALUES(43,'PZ-043','Plato decorativo Pachamama','Cerámica',1,430,'VENDIDA');
INSERT INTO "pieza" VALUES(44,'PZ-044','Cántaro Chakana','Cerámica',1,460,'VENDIDA');
INSERT INTO "pieza" VALUES(45,'PZ-045','Atril Mochica','Ebanistería',2,510,'VENDIDA');
INSERT INTO "pieza" VALUES(46,'PZ-046','Atril Pachamama','Ebanistería',2,410,'VENDIDA');
INSERT INTO "pieza" VALUES(47,'PZ-047','Bufanda Colibrí','Tejido',3,500,'VENDIDA');
INSERT INTO "pieza" VALUES(48,'PZ-048','Chullo Inca','Tejido',3,280,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(49,'PZ-049','Chalina Inca','Tejido',3,200,'VENDIDA');
INSERT INTO "pieza" VALUES(50,'PZ-050','Atril Quinua','Ebanistería',2,610,'VENDIDA');
INSERT INTO "pieza" VALUES(51,'PZ-051','Chalina Inca','Tejido',3,260,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(52,'PZ-052','Maceta Mochica','Cerámica',1,240,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(53,'PZ-053','Banco tallado Cóndor','Ebanistería',2,310,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(54,'PZ-054','Bufanda Titicaca','Tejido',3,320,'VENDIDA');
INSERT INTO "pieza" VALUES(55,'PZ-055','Atril Nazca','Ebanistería',2,470,'DISPONIBLE');
INSERT INTO "pieza" VALUES(56,'PZ-056','Tazón Cóndor','Cerámica',1,410,'DISPONIBLE');
INSERT INTO "pieza" VALUES(57,'PZ-057','Marco tallado Colibrí','Ebanistería',2,300,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(58,'PZ-058','Florero Chakana','Cerámica',1,470,'DISPONIBLE');
INSERT INTO "pieza" VALUES(59,'PZ-059','Cántaro Colibrí','Cerámica',1,360,'VENDIDA');
INSERT INTO "pieza" VALUES(60,'PZ-060','Bufanda Puma','Tejido',3,180,'DISPONIBLE');
INSERT INTO "pieza" VALUES(61,'PZ-061','Bufanda Cóndor','Tejido',3,350,'VENDIDA');
INSERT INTO "pieza" VALUES(62,'PZ-062','Atril Inca','Ebanistería',2,510,'DISPONIBLE');
INSERT INTO "pieza" VALUES(63,'PZ-063','Marco tallado Cóndor','Ebanistería',2,550,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(64,'PZ-064','Poncho Ayni','Tejido',3,320,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(65,'PZ-065','Banco tallado Inca','Ebanistería',2,590,'VENDIDA');
INSERT INTO "pieza" VALUES(66,'PZ-066','Jarrón Cóndor','Cerámica',1,400,'VENDIDA');
INSERT INTO "pieza" VALUES(67,'PZ-067','Poncho Mochica','Tejido',3,510,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(68,'PZ-068','Puerta decorativa Colibrí','Ebanistería',2,560,'DISPONIBLE');
INSERT INTO "pieza" VALUES(69,'PZ-069','Plato decorativo Nazca','Cerámica',1,200,'VENDIDA');
INSERT INTO "pieza" VALUES(70,'PZ-070','Jarrón Mochica','Cerámica',1,170,'DISPONIBLE');
INSERT INTO "pieza" VALUES(71,'PZ-071','Fuente Ayni','Cerámica',1,280,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(72,'PZ-072','Jarrón Machu','Cerámica',1,160,'VENDIDA');
INSERT INTO "pieza" VALUES(73,'PZ-073','Alfombra Inca','Tejido',3,360,'VENDIDA');
INSERT INTO "pieza" VALUES(74,'PZ-074','Chalina Wari','Tejido',3,450,'DISPONIBLE');
INSERT INTO "pieza" VALUES(75,'PZ-075','Cántaro Machu','Cerámica',1,410,'DISPONIBLE');
INSERT INTO "pieza" VALUES(76,'PZ-076','Chalina Mochica','Tejido',3,300,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(77,'PZ-077','Manta Mochica','Tejido',3,170,'DISPONIBLE');
INSERT INTO "pieza" VALUES(78,'PZ-078','Cofre Puma','Ebanistería',2,330,'DISPONIBLE');
INSERT INTO "pieza" VALUES(79,'PZ-079','Cofre Titicaca','Ebanistería',2,290,'VENDIDA');
INSERT INTO "pieza" VALUES(80,'PZ-080','Chullo Puma','Tejido',3,390,'DISPONIBLE');
INSERT INTO "pieza" VALUES(81,'PZ-081','Puerta decorativa Sol Andino','Ebanistería',2,530,'DISPONIBLE');
INSERT INTO "pieza" VALUES(82,'PZ-082','Tazón Machu','Cerámica',1,140,'VENDIDA');
INSERT INTO "pieza" VALUES(83,'PZ-083','Chullo Titicaca','Tejido',3,230,'VENDIDA');
INSERT INTO "pieza" VALUES(84,'PZ-084','Cofre Ayni','Ebanistería',2,550,'DISPONIBLE');
INSERT INTO "pieza" VALUES(85,'PZ-085','Marco tallado Titicaca','Ebanistería',2,490,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(86,'PZ-086','Alfombra Sol Andino','Tejido',3,370,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(87,'PZ-087','Alfombra Chakana','Tejido',3,480,'VENDIDA');
INSERT INTO "pieza" VALUES(88,'PZ-088','Fuente Nazca','Cerámica',1,250,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(89,'PZ-089','Poncho Cóndor','Tejido',3,250,'VENDIDA');
INSERT INTO "pieza" VALUES(90,'PZ-090','Espejo tallado Titicaca','Ebanistería',2,290,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(91,'PZ-091','Florero Mochica','Cerámica',1,370,'VENDIDA');
INSERT INTO "pieza" VALUES(92,'PZ-092','Plato decorativo Pachamama','Cerámica',1,150,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(93,'PZ-093','Cofre Cóndor','Ebanistería',2,390,'DISPONIBLE');
INSERT INTO "pieza" VALUES(94,'PZ-094','Banco tallado Wari','Ebanistería',2,320,'VENDIDA');
INSERT INTO "pieza" VALUES(95,'PZ-095','Plato decorativo Machu','Cerámica',1,520,'VENDIDA');
INSERT INTO "pieza" VALUES(96,'PZ-096','Alfombra Inca','Tejido',3,430,'VENDIDA');
INSERT INTO "pieza" VALUES(97,'PZ-097','Bufanda Sol Andino','Tejido',3,370,'VENDIDA');
INSERT INTO "pieza" VALUES(98,'PZ-098','Chullo Ayni','Tejido',3,470,'DISPONIBLE');
INSERT INTO "pieza" VALUES(99,'PZ-099','Poncho Ayni','Tejido',3,270,'VENDIDA');
INSERT INTO "pieza" VALUES(100,'PZ-100','Bufanda Colibrí','Tejido',3,180,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(101,'PZ-101','Banco tallado Chakana','Ebanistería',2,260,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(102,'PZ-102','Cofre Sol Andino','Ebanistería',2,400,'VENDIDA');
INSERT INTO "pieza" VALUES(103,'PZ-103','Bufanda Sol Andino','Tejido',3,450,'DISPONIBLE');
INSERT INTO "pieza" VALUES(104,'PZ-104','Banco tallado Machu','Ebanistería',2,560,'VENDIDA');
INSERT INTO "pieza" VALUES(105,'PZ-105','Fuente Quinua','Cerámica',1,450,'VENDIDA');
INSERT INTO "pieza" VALUES(106,'PZ-106','Alfombra Pachamama','Tejido',3,460,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(107,'PZ-107','Fuente Nazca','Cerámica',1,260,'VENDIDA');
INSERT INTO "pieza" VALUES(108,'PZ-108','Chullo Colibrí','Tejido',3,200,'VENDIDA');
INSERT INTO "pieza" VALUES(109,'PZ-109','Jarrón Sol Andino','Cerámica',1,380,'VENDIDA');
INSERT INTO "pieza" VALUES(110,'PZ-110','Puerta decorativa Inca','Ebanistería',2,500,'VENDIDA');
INSERT INTO "pieza" VALUES(111,'PZ-111','Alfombra Chakana','Tejido',3,250,'DISPONIBLE');
INSERT INTO "pieza" VALUES(112,'PZ-112','Plato decorativo Cóndor','Cerámica',1,240,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(113,'PZ-113','Manta Mochica','Tejido',3,320,'DISPONIBLE');
INSERT INTO "pieza" VALUES(114,'PZ-114','Bufanda Chakana','Tejido',3,440,'DISPONIBLE');
INSERT INTO "pieza" VALUES(115,'PZ-115','Jarrón Nazca','Cerámica',1,160,'EN_PRODUCCION');
INSERT INTO "pieza" VALUES(116,'PZ-116','Chalina Puma','Tejido',3,480,'VENDIDA');
INSERT INTO "pieza" VALUES(117,'PZ-117','Florero Ayni','Cerámica',1,420,'DISPONIBLE');
INSERT INTO "pieza" VALUES(118,'PZ-118','Chalina Quinua','Tejido',3,350,'DISPONIBLE');
INSERT INTO "pieza" VALUES(119,'PZ-119','Tazón Cóndor','Cerámica',1,190,'VENDIDA');
INSERT INTO "pieza" VALUES(120,'PZ-120','Jarrón Ayni','Cerámica',1,360,'VENDIDA');
CREATE TABLE produccion_pieza (
    id_produccion       INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pieza            INTEGER NOT NULL REFERENCES pieza(id_pieza),
    id_artesano         INTEGER NOT NULL REFERENCES artesano(id_artesano),
    etapa               VARCHAR(20) NOT NULL
                        CHECK (etapa IN ('MODELADO','SECADO','COCCION','TALLADO','TEJIDO','ACABADO')),
    fecha_inicio        DATE,
    fecha_fin           DATE,
    merma_descripcion   VARCHAR(200)
);
INSERT INTO "produccion_pieza" VALUES(1,1,32,'MODELADO','2026-10-03',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(2,3,44,'MODELADO','2026-08-04',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(3,27,46,'MODELADO','2026-09-19',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(4,34,50,'TALLADO','2026-07-18',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(5,39,7,'MODELADO','2026-07-04',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(6,48,60,'ACABADO','2026-07-22',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(7,51,42,'ACABADO','2026-07-06',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(8,52,43,'COCCION','2026-08-10',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(9,53,14,'TALLADO','2026-09-23',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(10,57,2,'TALLADO','2026-09-17',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(11,63,11,'MODELADO','2026-08-02',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(12,64,33,'ACABADO','2026-07-12',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(13,67,39,'ACABADO','2026-08-29',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(14,71,43,'COCCION','2026-08-11',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(15,76,27,'ACABADO','2026-10-06',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(16,85,59,'TALLADO','2026-09-02',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(17,86,30,'ACABADO','2026-07-25',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(18,88,10,'COCCION','2026-09-12',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(19,90,2,'MODELADO','2026-07-31',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(20,92,28,'COCCION','2026-10-09',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(21,100,39,'TEJIDO','2026-09-30',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(22,101,32,'MODELADO','2026-07-16',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(23,106,24,'ACABADO','2026-07-20',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(24,112,58,'SECADO','2026-09-24',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(25,115,52,'SECADO','2026-07-30',NULL,NULL);
INSERT INTO "produccion_pieza" VALUES(26,20,29,'ACABADO','2026-06-11','2026-07-08',NULL);
INSERT INTO "produccion_pieza" VALUES(27,117,37,'ACABADO','2026-05-23','2026-06-19',NULL);
INSERT INTO "produccion_pieza" VALUES(28,77,45,'ACABADO','2026-03-13','2026-04-03',NULL);
INSERT INTO "produccion_pieza" VALUES(29,58,49,'ACABADO','2026-03-08','2026-03-23',NULL);
INSERT INTO "produccion_pieza" VALUES(30,78,59,'ACABADO','2026-03-23','2026-04-03',NULL);
INSERT INTO "produccion_pieza" VALUES(31,74,18,'ACABADO','2026-02-24','2026-03-15',NULL);
INSERT INTO "produccion_pieza" VALUES(32,42,56,'ACABADO','2026-04-25','2026-05-26',NULL);
INSERT INTO "produccion_pieza" VALUES(33,68,38,'ACABADO','2026-02-06','2026-03-02',NULL);
INSERT INTO "produccion_pieza" VALUES(34,55,5,'ACABADO','2026-06-16','2026-07-11',NULL);
INSERT INTO "produccion_pieza" VALUES(35,9,5,'ACABADO','2026-06-10','2026-06-29',NULL);
INSERT INTO "produccion_pieza" VALUES(36,111,33,'ACABADO','2026-06-06','2026-07-02',NULL);
INSERT INTO "produccion_pieza" VALUES(37,103,42,'ACABADO','2026-05-28','2026-06-16',NULL);
INSERT INTO "produccion_pieza" VALUES(38,4,53,'ACABADO','2026-03-03','2026-04-04',NULL);
INSERT INTO "produccion_pieza" VALUES(39,30,58,'ACABADO','2026-05-15','2026-06-03',NULL);
INSERT INTO "produccion_pieza" VALUES(40,29,35,'ACABADO','2026-05-14','2026-06-04',NULL);
INSERT INTO "produccion_pieza" VALUES(41,10,23,'ACABADO','2026-04-14','2026-05-10',NULL);
INSERT INTO "produccion_pieza" VALUES(42,56,49,'ACABADO','2026-01-08','2026-01-31',NULL);
INSERT INTO "produccion_pieza" VALUES(43,80,60,'ACABADO','2026-04-24','2026-05-16',NULL);
INSERT INTO "produccion_pieza" VALUES(44,12,24,'ACABADO','2026-04-08','2026-05-15',NULL);
INSERT INTO "produccion_pieza" VALUES(45,33,39,'ACABADO','2026-05-28','2026-06-25',NULL);
INSERT INTO "produccion_pieza" VALUES(46,98,3,'ACABADO','2026-04-06','2026-05-13',NULL);
INSERT INTO "produccion_pieza" VALUES(47,113,21,'ACABADO','2026-02-01','2026-02-18',NULL);
INSERT INTO "produccion_pieza" VALUES(48,93,59,'ACABADO','2026-02-18','2026-03-15',NULL);
INSERT INTO "produccion_pieza" VALUES(49,84,17,'ACABADO','2026-04-15','2026-05-10',NULL);
INSERT INTO "produccion_pieza" VALUES(50,81,20,'ACABADO','2026-04-26','2026-05-22',NULL);
INSERT INTO "produccion_pieza" VALUES(51,60,54,'ACABADO','2026-04-10','2026-04-20',NULL);
INSERT INTO "produccion_pieza" VALUES(52,118,12,'ACABADO','2026-01-26','2026-02-08',NULL);
INSERT INTO "produccion_pieza" VALUES(53,62,11,'ACABADO','2026-03-01','2026-03-23',NULL);
INSERT INTO "produccion_pieza" VALUES(54,114,36,'ACABADO','2026-05-02','2026-05-31',NULL);
INSERT INTO "produccion_pieza" VALUES(55,28,10,'ACABADO','2026-06-16','2026-07-12',NULL);
CREATE TABLE cliente (
    id_cliente          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre              VARCHAR(120) NOT NULL,
    documento           VARCHAR(20)  NOT NULL UNIQUE,
    tipo                VARCHAR(20)  NOT NULL
                        CHECK (tipo IN ('COLECCIONISTA','MAYORISTA','PARTICULAR')),
    telefono            VARCHAR(20),
    puntos_fidelizacion INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "cliente" VALUES(1,'Galería Arequipa S.A.C.','6103235710','MAYORISTA','910 199 167',30);
INSERT INTO "cliente" VALUES(2,'Carmen Ramos Paucar','30224031','PARTICULAR','922 759 208',10);
INSERT INTO "cliente" VALUES(3,'Ana Yupanqui Mamani','75191287','COLECCIONISTA','925 188 454',50);
INSERT INTO "cliente" VALUES(4,'Carmen Choque Huanca','30051879','COLECCIONISTA','922 663 914',60);
INSERT INTO "cliente" VALUES(5,'Rosa Quispe Ramos','27574622','PARTICULAR','969 533 997',50);
INSERT INTO "cliente" VALUES(6,'Hugo Quispe Choque','69296377','COLECCIONISTA','970 459 865',140);
INSERT INTO "cliente" VALUES(7,'Hogar y Arte Piura S.A.C.','13106981191','MAYORISTA','991 170 361',0);
INSERT INTO "cliente" VALUES(8,'Juan Ccori Mamani','66990323','COLECCIONISTA','911 977 245',80);
INSERT INTO "cliente" VALUES(9,'Víctor Callo Huamán','44645203','PARTICULAR','998 331 473',30);
INSERT INTO "cliente" VALUES(10,'Rosa Yupanqui Callo','65095231','COLECCIONISTA','989 370 426',70);
INSERT INTO "cliente" VALUES(11,'José Torres Huanca','51711543','PARTICULAR','987 636 285',80);
INSERT INTO "cliente" VALUES(12,'Pedro Apaza Yupanqui','43964953','PARTICULAR','942 639 571',60);
INSERT INTO "cliente" VALUES(13,'Regalos Arequipa S.A.C.','14151031582','MAYORISTA','936 824 891',50);
INSERT INTO "cliente" VALUES(14,'Mario Huanca Apaza','31874926','PARTICULAR','949 371 418',60);
INSERT INTO "cliente" VALUES(15,'María Salas Condori','43124086','COLECCIONISTA','986 709 445',110);
INSERT INTO "cliente" VALUES(16,'Ana Paucar Ramos','26479628','PARTICULAR','964 726 572',50);
INSERT INTO "cliente" VALUES(17,'Mario Huanca Huanca','24294785','PARTICULAR','965 873 796',10);
INSERT INTO "cliente" VALUES(18,'Delia Paucar Ccori','53545356','PARTICULAR','911 878 464',0);
INSERT INTO "cliente" VALUES(19,'Galería Piura S.A.C.','2080745180','MAYORISTA','969 145 717',10);
INSERT INTO "cliente" VALUES(20,'Raúl Apaza Callo','49454811','COLECCIONISTA','916 218 888',50);
INSERT INTO "cliente" VALUES(21,'Marta Paucar Flores','67949237','PARTICULAR','942 102 311',140);
INSERT INTO "cliente" VALUES(22,'Rosa Condori Mamani','17740289','COLECCIONISTA','916 825 475',40);
INSERT INTO "cliente" VALUES(23,'Néstor Apaza Apaza','23841477','PARTICULAR','991 732 155',40);
INSERT INTO "cliente" VALUES(24,'Juan Huanca Paucar','27037476','PARTICULAR','939 219 811',60);
INSERT INTO "cliente" VALUES(25,'Decoraciones Miraflores S.A.C.','4307091707','MAYORISTA','985 995 852',10);
INSERT INTO "cliente" VALUES(26,'Luz Choque Huanca','14938359','PARTICULAR','981 853 124',100);
INSERT INTO "cliente" VALUES(27,'Carmen Condori Salas','64888845','PARTICULAR','916 524 419',60);
INSERT INTO "cliente" VALUES(28,'Raúl Mamani Yupanqui','45901030','COLECCIONISTA','960 833 149',100);
INSERT INTO "cliente" VALUES(29,'Delia Paucar Huanca','70852886','COLECCIONISTA','971 551 750',120);
INSERT INTO "cliente" VALUES(30,'Luis Callo Callo','10112314','COLECCIONISTA','922 915 231',100);
INSERT INTO "cliente" VALUES(31,'Galería Surco S.A.C.','6160737127','MAYORISTA','977 736 254',30);
INSERT INTO "cliente" VALUES(32,'Carlos Callo Callo','53133690','COLECCIONISTA','998 402 131',70);
INSERT INTO "cliente" VALUES(33,'Carmen Paucar Huamán','35947348','COLECCIONISTA','956 500 176',10);
INSERT INTO "cliente" VALUES(34,'Delia Ramos Huamán','59264105','COLECCIONISTA','945 665 324',0);
INSERT INTO "cliente" VALUES(35,'Marta Huamán Flores','55658540','COLECCIONISTA','978 675 213',20);
INSERT INTO "cliente" VALUES(36,'Carmen Apaza Ccori','40220275','COLECCIONISTA','927 274 253',50);
INSERT INTO "cliente" VALUES(37,'Galería Miraflores S.A.C.','18033885198','MAYORISTA','959 357 702',40);
INSERT INTO "cliente" VALUES(38,'Elena Condori Callo','58741029','PARTICULAR','932 468 585',0);
INSERT INTO "cliente" VALUES(39,'Néstor Flores Callo','28159473','COLECCIONISTA','978 150 668',20);
INSERT INTO "cliente" VALUES(40,'Marta Choque Ramos','40377727','PARTICULAR','914 412 255',10);
INSERT INTO "cliente" VALUES(41,'Julia Salas Callo','70972846','PARTICULAR','923 312 414',80);
INSERT INTO "cliente" VALUES(42,'Víctor Huamán Choque','44685836','COLECCIONISTA','950 390 405',130);
INSERT INTO "cliente" VALUES(43,'Artesanías Miraflores S.A.C.','8901735503','MAYORISTA','935 769 307',0);
INSERT INTO "cliente" VALUES(44,'Ana Condori Quispe','14033506','COLECCIONISTA','990 960 426',90);
INSERT INTO "cliente" VALUES(45,'Hugo Apaza Huanca','43959854','COLECCIONISTA','962 799 442',50);
INSERT INTO "cliente" VALUES(46,'Mario Huanca Ramos','15735440','COLECCIONISTA','983 834 604',30);
INSERT INTO "cliente" VALUES(47,'Pedro Ramos Ramos','67572854','PARTICULAR','953 994 471',10);
INSERT INTO "cliente" VALUES(48,'Raúl Ramos Apaza','44092391','COLECCIONISTA','954 916 512',40);
INSERT INTO "cliente" VALUES(49,'Regalos Lima S.A.C.','3297607315','MAYORISTA','965 576 798',20);
INSERT INTO "cliente" VALUES(50,'Hugo Mamani Huanca','15303872','COLECCIONISTA','994 584 513',30);
INSERT INTO "cliente" VALUES(51,'Juan Flores Huamán','57772419','COLECCIONISTA','941 532 330',70);
INSERT INTO "cliente" VALUES(52,'Elena Choque Ramos','47347875','COLECCIONISTA','911 224 139',30);
INSERT INTO "cliente" VALUES(53,'Carlos Paucar Salas','57126370','PARTICULAR','992 235 934',80);
INSERT INTO "cliente" VALUES(54,'Carlos Flores Callo','50473923','COLECCIONISTA','965 393 532',160);
INSERT INTO "cliente" VALUES(55,'Importadora Piura S.A.C.','16431715350','MAYORISTA','935 191 506',70);
INSERT INTO "cliente" VALUES(56,'Elena Yupanqui Apaza','59393855','PARTICULAR','986 686 886',50);
INSERT INTO "cliente" VALUES(57,'Ana Torres Condori','45137134','PARTICULAR','952 663 191',10);
INSERT INTO "cliente" VALUES(58,'Carlos Huamán Choque','45968575','COLECCIONISTA','932 325 839',110);
INSERT INTO "cliente" VALUES(59,'Néstor Paucar Choque','51442906','COLECCIONISTA','968 143 380',80);
INSERT INTO "cliente" VALUES(60,'Pedro Flores Huanca','22318315','PARTICULAR','969 444 812',100);
CREATE TABLE venta (
    id_venta        INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente      INTEGER REFERENCES cliente(id_cliente),
    fecha           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total           NUMERIC(10,2) NOT NULL DEFAULT 0,
    canal           VARCHAR(20) NOT NULL CHECK (canal IN ('TIENDA','FERIA','EN_LINEA'))
);
INSERT INTO "venta" VALUES(1,2,'2026-03-01 16:03:00',980,'TIENDA');
INSERT INTO "venta" VALUES(2,29,'2026-10-04 09:12:00',370,'EN_LINEA');
INSERT INTO "venta" VALUES(3,13,'2026-03-16 12:02:00',250,'FERIA');
INSERT INTO "venta" VALUES(4,13,'2026-08-02 09:19:00',260,'EN_LINEA');
INSERT INTO "venta" VALUES(5,29,'2026-09-16 17:44:00',250,'TIENDA');
INSERT INTO "venta" VALUES(6,26,'2026-07-23 10:57:00',380,'TIENDA');
INSERT INTO "venta" VALUES(7,16,'2026-05-13 14:05:00',360,'TIENDA');
INSERT INTO "venta" VALUES(8,NULL,'2026-01-06 09:15:00',560,'EN_LINEA');
INSERT INTO "venta" VALUES(9,4,'2026-04-02 13:00:00',450,'EN_LINEA');
INSERT INTO "venta" VALUES(10,1,'2026-04-01 13:10:00',410,'FERIA');
INSERT INTO "venta" VALUES(11,29,'2026-04-25 10:56:00',460,'FERIA');
INSERT INTO "venta" VALUES(12,22,'2026-08-04 14:11:00',420,'EN_LINEA');
INSERT INTO "venta" VALUES(13,6,'2026-04-02 11:26:00',460,'FERIA');
INSERT INTO "venta" VALUES(14,46,'2026-01-17 10:50:00',370,'TIENDA');
INSERT INTO "venta" VALUES(15,52,'2026-10-28 16:30:00',360,'TIENDA');
INSERT INTO "venta" VALUES(16,32,'2026-06-26 18:46:00',290,'TIENDA');
INSERT INTO "venta" VALUES(17,40,'2026-10-23 11:13:00',260,'EN_LINEA');
INSERT INTO "venta" VALUES(18,48,'2026-09-03 12:12:00',510,'FERIA');
INSERT INTO "venta" VALUES(19,9,'2026-01-27 16:43:00',190,'TIENDA');
INSERT INTO "venta" VALUES(20,8,'2026-09-14 14:35:00',200,'TIENDA');
INSERT INTO "venta" VALUES(21,38,'2026-03-27 18:38:00',530,'TIENDA');
INSERT INTO "venta" VALUES(22,60,'2026-05-16 09:42:00',150,'FERIA');
INSERT INTO "venta" VALUES(23,NULL,'2026-08-27 14:20:00',440,'FERIA');
INSERT INTO "venta" VALUES(24,4,'2026-09-11 15:25:00',500,'TIENDA');
INSERT INTO "venta" VALUES(25,26,'2026-06-04 16:26:00',160,'EN_LINEA');
INSERT INTO "venta" VALUES(26,21,'2026-03-27 18:29:00',400,'TIENDA');
INSERT INTO "venta" VALUES(27,47,'2026-05-18 10:08:00',140,'FERIA');
INSERT INTO "venta" VALUES(28,58,'2026-02-15 19:43:00',290,'EN_LINEA');
INSERT INTO "venta" VALUES(29,17,'2026-03-13 12:52:00',500,'EN_LINEA');
INSERT INTO "venta" VALUES(30,52,'2026-07-13 11:33:00',350,'TIENDA');
INSERT INTO "venta" VALUES(31,43,'2026-10-01 18:50:00',280,'TIENDA');
INSERT INTO "venta" VALUES(32,47,'2026-01-17 11:45:00',230,'EN_LINEA');
INSERT INTO "venta" VALUES(33,41,'2026-05-05 11:01:00',290,'EN_LINEA');
INSERT INTO "venta" VALUES(34,26,'2026-05-05 11:33:00',370,'TIENDA');
INSERT INTO "venta" VALUES(35,2,'2026-08-23 19:51:00',470,'EN_LINEA');
INSERT INTO "venta" VALUES(36,25,'2026-06-02 09:56:00',400,'EN_LINEA');
INSERT INTO "venta" VALUES(37,34,'2026-02-18 18:42:00',360,'EN_LINEA');
INSERT INTO "venta" VALUES(38,NULL,'2026-08-01 13:07:00',590,'FERIA');
INSERT INTO "venta" VALUES(39,59,'2026-02-15 17:03:00',400,'TIENDA');
INSERT INTO "venta" VALUES(40,48,'2026-04-08 19:09:00',490,'FERIA');
INSERT INTO "venta" VALUES(41,38,'2026-03-13 14:56:00',230,'EN_LINEA');
INSERT INTO "venta" VALUES(42,13,'2026-07-24 19:30:00',380,'EN_LINEA');
INSERT INTO "venta" VALUES(43,26,'2026-03-15 09:41:00',450,'EN_LINEA');
INSERT INTO "venta" VALUES(44,45,'2026-03-04 18:25:00',430,'EN_LINEA');
INSERT INTO "venta" VALUES(45,7,'2026-02-06 12:33:00',240,'FERIA');
INSERT INTO "venta" VALUES(46,30,'2026-07-02 09:01:00',230,'TIENDA');
INSERT INTO "venta" VALUES(47,35,'2026-03-07 15:48:00',480,'EN_LINEA');
INSERT INTO "venta" VALUES(48,39,'2026-10-13 14:13:00',450,'FERIA');
INSERT INTO "venta" VALUES(49,32,'2026-04-05 13:49:00',540,'FERIA');
INSERT INTO "venta" VALUES(50,21,'2026-06-28 09:04:00',430,'TIENDA');
INSERT INTO "venta" VALUES(51,4,'2026-06-04 09:27:00',460,'TIENDA');
INSERT INTO "venta" VALUES(52,47,'2026-08-03 16:04:00',320,'EN_LINEA');
INSERT INTO "venta" VALUES(53,NULL,'2026-02-06 13:14:00',460,'TIENDA');
INSERT INTO "venta" VALUES(54,27,'2026-06-03 14:35:00',610,'FERIA');
INSERT INTO "venta" VALUES(55,56,'2026-01-20 17:41:00',320,'FERIA');
INSERT INTO "venta" VALUES(56,50,'2026-09-01 10:20:00',200,'FERIA');
INSERT INTO "venta" VALUES(57,25,'2026-04-04 10:02:00',540,'TIENDA');
INSERT INTO "venta" VALUES(58,12,'2026-01-05 14:00:00',520,'TIENDA');
INSERT INTO "venta" VALUES(59,54,'2026-02-12 11:00:00',540,'FERIA');
INSERT INTO "venta" VALUES(60,18,'2026-02-03 17:57:00',270,'TIENDA');
CREATE TABLE venta_detalle (
    id_detalle      INTEGER PRIMARY KEY AUTOINCREMENT,
    id_venta        INTEGER NOT NULL REFERENCES venta(id_venta) ON DELETE CASCADE,
    id_pieza        INTEGER NOT NULL REFERENCES pieza(id_pieza),
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio          NUMERIC(10,2) NOT NULL CHECK (precio >= 0)
);
INSERT INTO "venta_detalle" VALUES(1,1,116,1,480);
INSERT INTO "venta_detalle" VALUES(2,1,22,1,500);
INSERT INTO "venta_detalle" VALUES(3,2,41,1,170);
INSERT INTO "venta_detalle" VALUES(4,2,69,1,200);
INSERT INTO "venta_detalle" VALUES(5,3,19,1,250);
INSERT INTO "venta_detalle" VALUES(6,4,107,1,260);
INSERT INTO "venta_detalle" VALUES(7,5,89,1,250);
INSERT INTO "venta_detalle" VALUES(8,6,36,1,380);
INSERT INTO "venta_detalle" VALUES(9,7,120,1,360);
INSERT INTO "venta_detalle" VALUES(10,8,104,1,560);
INSERT INTO "venta_detalle" VALUES(11,9,105,1,450);
INSERT INTO "venta_detalle" VALUES(12,10,46,1,410);
INSERT INTO "venta_detalle" VALUES(13,11,17,1,460);
INSERT INTO "venta_detalle" VALUES(14,12,5,1,420);
INSERT INTO "venta_detalle" VALUES(15,13,14,1,460);
INSERT INTO "venta_detalle" VALUES(16,14,97,1,370);
INSERT INTO "venta_detalle" VALUES(17,15,59,1,360);
INSERT INTO "venta_detalle" VALUES(18,16,21,1,290);
INSERT INTO "venta_detalle" VALUES(19,17,32,1,260);
INSERT INTO "venta_detalle" VALUES(20,18,45,1,510);
INSERT INTO "venta_detalle" VALUES(21,19,119,1,190);
INSERT INTO "venta_detalle" VALUES(22,20,49,1,200);
INSERT INTO "venta_detalle" VALUES(23,21,6,1,530);
INSERT INTO "venta_detalle" VALUES(24,22,38,1,150);
INSERT INTO "venta_detalle" VALUES(25,23,37,1,440);
INSERT INTO "venta_detalle" VALUES(26,24,47,1,500);
INSERT INTO "venta_detalle" VALUES(27,25,72,1,160);
INSERT INTO "venta_detalle" VALUES(28,26,66,1,400);
INSERT INTO "venta_detalle" VALUES(29,27,82,1,140);
INSERT INTO "venta_detalle" VALUES(30,28,79,1,290);
INSERT INTO "venta_detalle" VALUES(31,29,110,1,500);
INSERT INTO "venta_detalle" VALUES(32,30,61,1,350);
INSERT INTO "venta_detalle" VALUES(33,31,18,1,280);
INSERT INTO "venta_detalle" VALUES(34,32,31,1,230);
INSERT INTO "venta_detalle" VALUES(35,33,2,1,290);
INSERT INTO "venta_detalle" VALUES(36,34,91,1,370);
INSERT INTO "venta_detalle" VALUES(37,35,25,1,470);
INSERT INTO "venta_detalle" VALUES(38,36,23,1,400);
INSERT INTO "venta_detalle" VALUES(39,37,73,1,360);
INSERT INTO "venta_detalle" VALUES(40,38,65,1,590);
INSERT INTO "venta_detalle" VALUES(41,39,102,1,400);
INSERT INTO "venta_detalle" VALUES(42,40,24,1,490);
INSERT INTO "venta_detalle" VALUES(43,41,16,1,230);
INSERT INTO "venta_detalle" VALUES(44,42,109,1,380);
INSERT INTO "venta_detalle" VALUES(45,43,8,1,450);
INSERT INTO "venta_detalle" VALUES(46,44,96,1,430);
INSERT INTO "venta_detalle" VALUES(47,45,26,1,240);
INSERT INTO "venta_detalle" VALUES(48,46,83,1,230);
INSERT INTO "venta_detalle" VALUES(49,47,87,1,480);
INSERT INTO "venta_detalle" VALUES(50,48,15,1,450);
INSERT INTO "venta_detalle" VALUES(51,49,13,1,540);
INSERT INTO "venta_detalle" VALUES(52,50,43,1,430);
INSERT INTO "venta_detalle" VALUES(53,51,35,1,460);
INSERT INTO "venta_detalle" VALUES(54,52,94,1,320);
INSERT INTO "venta_detalle" VALUES(55,53,44,1,460);
INSERT INTO "venta_detalle" VALUES(56,54,50,1,610);
INSERT INTO "venta_detalle" VALUES(57,55,54,1,320);
INSERT INTO "venta_detalle" VALUES(58,56,108,1,200);
INSERT INTO "venta_detalle" VALUES(59,57,40,1,540);
INSERT INTO "venta_detalle" VALUES(60,58,95,1,520);
INSERT INTO "venta_detalle" VALUES(61,59,11,1,540);
INSERT INTO "venta_detalle" VALUES(62,60,99,1,270);
CREATE TABLE encargo (
    id_encargo      INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente      INTEGER NOT NULL REFERENCES cliente(id_cliente),
    id_taller       INTEGER NOT NULL REFERENCES taller(id_taller),
    id_artesano     INTEGER REFERENCES artesano(id_artesano),
    descripcion     VARCHAR(300) NOT NULL,
    fecha_entrega   DATE,
    estado          VARCHAR(20) NOT NULL DEFAULT 'REGISTRADO'
                    CHECK (estado IN ('REGISTRADO','EN_PRODUCCION','ENTREGADO'))
);
INSERT INTO "encargo" VALUES(1,53,3,NULL,'Poncho a medida','2026-11-07','ENTREGADO');
INSERT INTO "encargo" VALUES(2,8,3,30,'Poncho a medida','2026-11-21','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(3,33,3,21,'Alfombra tejida','2026-10-20','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(4,24,3,24,'Manta de alpaca','2026-10-19','REGISTRADO');
INSERT INTO "encargo" VALUES(5,12,1,16,'Cántaro decorativo grande','2026-10-11','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(6,32,3,21,'Alfombra tejida','2026-08-17','ENTREGADO');
INSERT INTO "encargo" VALUES(7,46,2,29,'Marco tallado para espejo','2026-07-16','REGISTRADO');
INSERT INTO "encargo" VALUES(8,54,2,29,'Atril para biblia','2026-08-26','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(9,44,3,30,'Manta de alpaca','2026-06-19','ENTREGADO');
INSERT INTO "encargo" VALUES(10,28,1,NULL,'Vajilla de 12 piezas','2026-11-14','ENTREGADO');
INSERT INTO "encargo" VALUES(11,52,1,58,'Maceta con relieve','2026-07-03','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(12,26,2,38,'Marco tallado para espejo','2026-06-24','ENTREGADO');
INSERT INTO "encargo" VALUES(13,15,3,9,'Manta de alpaca','2026-07-24','ENTREGADO');
INSERT INTO "encargo" VALUES(14,22,3,36,'Poncho a medida','2026-06-26','REGISTRADO');
INSERT INTO "encargo" VALUES(15,30,3,36,'Poncho a medida','2026-09-08','ENTREGADO');
INSERT INTO "encargo" VALUES(16,28,2,32,'Puerta tallada','2026-10-10','REGISTRADO');
INSERT INTO "encargo" VALUES(17,33,1,19,'Maceta con relieve','2026-11-02','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(18,35,3,39,'Alfombra tejida','2026-08-11','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(19,40,1,NULL,'Maceta con relieve','2026-06-26','REGISTRADO');
INSERT INTO "encargo" VALUES(20,54,2,38,'Puerta tallada','2026-11-07','ENTREGADO');
INSERT INTO "encargo" VALUES(21,12,1,43,'Juego de tazas personalizado','2026-07-04','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(22,53,2,14,'Atril para biblia','2026-07-23','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(23,22,3,48,'Alfombra tejida','2026-08-21','REGISTRADO');
INSERT INTO "encargo" VALUES(24,6,3,36,'Alfombra tejida','2026-10-18','ENTREGADO');
INSERT INTO "encargo" VALUES(25,36,2,47,'Cofre con iniciales','2026-04-26','REGISTRADO');
INSERT INTO "encargo" VALUES(26,28,3,57,'Manta de alpaca','2026-11-07','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(27,41,1,55,'Maceta con relieve','2026-07-28','REGISTRADO');
INSERT INTO "encargo" VALUES(28,16,3,NULL,'Alfombra tejida','2026-05-07','ENTREGADO');
INSERT INTO "encargo" VALUES(29,50,1,1,'Maceta con relieve','2026-07-28','REGISTRADO');
INSERT INTO "encargo" VALUES(30,12,3,3,'Manta de alpaca','2026-05-27','REGISTRADO');
INSERT INTO "encargo" VALUES(31,6,1,1,'Maceta con relieve','2026-09-19','ENTREGADO');
INSERT INTO "encargo" VALUES(32,12,1,28,'Maceta con relieve','2026-08-25','ENTREGADO');
INSERT INTO "encargo" VALUES(33,47,1,37,'Cántaro decorativo grande','2026-06-24','REGISTRADO');
INSERT INTO "encargo" VALUES(34,55,2,8,'Atril para biblia','2026-10-30','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(35,60,2,41,'Atril para biblia','2026-06-23','ENTREGADO');
INSERT INTO "encargo" VALUES(36,8,1,19,'Maceta con relieve','2026-10-10','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(37,29,2,NULL,'Cofre con iniciales','2026-05-06','ENTREGADO');
INSERT INTO "encargo" VALUES(38,54,2,35,'Cofre con iniciales','2026-11-20','REGISTRADO');
INSERT INTO "encargo" VALUES(39,42,2,44,'Atril para biblia','2026-08-05','ENTREGADO');
INSERT INTO "encargo" VALUES(40,5,1,16,'Juego de tazas personalizado','2026-11-05','ENTREGADO');
INSERT INTO "encargo" VALUES(41,5,1,16,'Cántaro decorativo grande','2026-10-18','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(42,27,2,50,'Cofre con iniciales','2026-11-25','ENTREGADO');
INSERT INTO "encargo" VALUES(43,15,1,7,'Cántaro decorativo grande','2026-10-29','ENTREGADO');
INSERT INTO "encargo" VALUES(44,18,1,55,'Maceta con relieve','2026-05-08','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(45,41,2,14,'Puerta tallada','2026-05-23','REGISTRADO');
INSERT INTO "encargo" VALUES(46,4,3,NULL,'Alfombra tejida','2026-06-29','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(47,21,1,37,'Maceta con relieve','2026-09-07','ENTREGADO');
INSERT INTO "encargo" VALUES(48,7,3,48,'Alfombra tejida','2026-10-10','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(49,21,2,29,'Cofre con iniciales','2026-08-03','EN_PRODUCCION');
INSERT INTO "encargo" VALUES(50,21,1,25,'Juego de tazas personalizado','2026-11-20','ENTREGADO');
INSERT INTO "encargo" VALUES(51,24,1,28,'Vajilla de 12 piezas','2026-07-29','REGISTRADO');
INSERT INTO "encargo" VALUES(52,54,1,34,'Vajilla de 12 piezas','2026-07-08','ENTREGADO');
INSERT INTO "encargo" VALUES(53,30,3,3,'Juego de chullos','2026-10-14','REGISTRADO');
INSERT INTO "encargo" VALUES(54,58,3,12,'Juego de chullos','2026-09-01','ENTREGADO');
INSERT INTO "encargo" VALUES(55,8,1,NULL,'Cántaro decorativo grande','2026-11-06','REGISTRADO');
DELETE FROM "sqlite_sequence";
INSERT INTO "sqlite_sequence" VALUES('proveedor',50);
INSERT INTO "sqlite_sequence" VALUES('taller',3);
INSERT INTO "sqlite_sequence" VALUES('artesano',60);
INSERT INTO "sqlite_sequence" VALUES('insumo',60);
INSERT INTO "sqlite_sequence" VALUES('pieza',120);
INSERT INTO "sqlite_sequence" VALUES('produccion_pieza',55);
INSERT INTO "sqlite_sequence" VALUES('cliente',60);
INSERT INTO "sqlite_sequence" VALUES('venta',60);
INSERT INTO "sqlite_sequence" VALUES('venta_detalle',62);
INSERT INTO "sqlite_sequence" VALUES('encargo',55);
COMMIT;

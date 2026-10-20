--
-- PostgreSQL database dump
--

\restrict dOv418J65LERtMXi3wtEjtF4hf5pQt4hOF6SsJ51EcZ4A4wzUO6MVNw8HncydAf

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bitacora; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bitacora (
    bitacora_id integer NOT NULL,
    tipo_evento character varying(50) NOT NULL,
    referencia character varying(50),
    detalle text,
    creado_en timestamp without time zone DEFAULT (now() AT TIME ZONE 'America/Guatemala'::text) NOT NULL
);


--
-- Name: bitacora_bitacora_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bitacora_bitacora_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bitacora_bitacora_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bitacora_bitacora_id_seq OWNED BY public.bitacora.bitacora_id;


--
-- Name: configuracion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion (
    clave character varying(50) NOT NULL,
    valor text NOT NULL,
    actualizado_en timestamp without time zone DEFAULT now()
);


--
-- Name: errores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.errores (
    error_id integer NOT NULL,
    workflow character varying(50) NOT NULL,
    mensaje text NOT NULL,
    payload jsonb,
    creado_en timestamp without time zone DEFAULT (now() AT TIME ZONE 'America/Guatemala'::text) NOT NULL
);


--
-- Name: errores_error_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.errores_error_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: errores_error_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.errores_error_id_seq OWNED BY public.errores.error_id;


--
-- Name: items_almuerzo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items_almuerzo (
    item_almuerzo_id integer NOT NULL,
    menu_id integer NOT NULL,
    platillo_id integer NOT NULL,
    variante character varying(50) DEFAULT 'estándar'::character varying NOT NULL,
    precio numeric(8,2) NOT NULL,
    cantidad_disponible integer DEFAULT 0 NOT NULL,
    agotado boolean DEFAULT false NOT NULL
);


--
-- Name: items_almuerzo_item_almuerzo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.items_almuerzo_item_almuerzo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_almuerzo_item_almuerzo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.items_almuerzo_item_almuerzo_id_seq OWNED BY public.items_almuerzo.item_almuerzo_id;


--
-- Name: items_desayuno; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items_desayuno (
    item_desayuno_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    precio numeric(8,2) NOT NULL,
    disponible boolean DEFAULT true NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: items_desayuno_item_desayuno_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.items_desayuno_item_desayuno_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: items_desayuno_item_desayuno_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.items_desayuno_item_desayuno_id_seq OWNED BY public.items_desayuno.item_desayuno_id;


--
-- Name: menus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menus (
    menu_id integer NOT NULL,
    fecha_vigencia date NOT NULL,
    hora_bloqueo time without time zone DEFAULT '11:00:00'::time without time zone NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp without time zone DEFAULT (now() AT TIME ZONE 'America/Guatemala'::text) NOT NULL
);


--
-- Name: menus_menu_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.menus_menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: menus_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.menus_menu_id_seq OWNED BY public.menus.menu_id;


--
-- Name: pedido_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedido_items (
    pedido_item_id integer NOT NULL,
    pedido_id integer NOT NULL,
    origen character varying(20) NOT NULL,
    item_almuerzo_id integer,
    item_desayuno_id integer,
    cantidad integer NOT NULL,
    CONSTRAINT pedido_items_origen_check CHECK (((origen)::text = ANY ((ARRAY['desayuno'::character varying, 'almuerzo'::character varying])::text[])))
);


--
-- Name: pedido_items_pedido_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedido_items_pedido_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pedido_items_pedido_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedido_items_pedido_item_id_seq OWNED BY public.pedido_items.pedido_item_id;


--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedidos (
    pedido_id integer NOT NULL,
    codigo character varying(10) NOT NULL,
    cliente_nombre character varying(100),
    cliente_telefono character varying(20) NOT NULL,
    total numeric(8,2) NOT NULL,
    estado character varying(20) DEFAULT 'preparando'::character varying NOT NULL,
    creado_en timestamp without time zone DEFAULT (now() AT TIME ZONE 'America/Guatemala'::text) NOT NULL,
    cliente_email character varying(150),
    tipo_entrega character varying(20),
    CONSTRAINT chk_pedidos_estado CHECK (((estado)::text = ANY ((ARRAY['preparando'::character varying, 'listo'::character varying, 'completado'::character varying])::text[]))),
    CONSTRAINT pedidos_tipo_entrega_check CHECK (((tipo_entrega)::text = ANY ((ARRAY['domicilio'::character varying, 'recoger'::character varying, 'mesa'::character varying])::text[])))
);


--
-- Name: pedidos_pedido_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedidos_pedido_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pedidos_pedido_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedidos_pedido_id_seq OWNED BY public.pedidos.pedido_id;


--
-- Name: platillos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platillos (
    platillo_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: platillos_platillo_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platillos_platillo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: platillos_platillo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platillos_platillo_id_seq OWNED BY public.platillos.platillo_id;


--
-- Name: bitacora bitacora_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bitacora ALTER COLUMN bitacora_id SET DEFAULT nextval('public.bitacora_bitacora_id_seq'::regclass);


--
-- Name: errores error_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.errores ALTER COLUMN error_id SET DEFAULT nextval('public.errores_error_id_seq'::regclass);


--
-- Name: items_almuerzo item_almuerzo_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items_almuerzo ALTER COLUMN item_almuerzo_id SET DEFAULT nextval('public.items_almuerzo_item_almuerzo_id_seq'::regclass);


--
-- Name: items_desayuno item_desayuno_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items_desayuno ALTER COLUMN item_desayuno_id SET DEFAULT nextval('public.items_desayuno_item_desayuno_id_seq'::regclass);


--
-- Name: menus menu_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus ALTER COLUMN menu_id SET DEFAULT nextval('public.menus_menu_id_seq'::regclass);


--
-- Name: pedido_items pedido_item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items ALTER COLUMN pedido_item_id SET DEFAULT nextval('public.pedido_items_pedido_item_id_seq'::regclass);


--
-- Name: pedidos pedido_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN pedido_id SET DEFAULT nextval('public.pedidos_pedido_id_seq'::regclass);


--
-- Name: platillos platillo_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platillos ALTER COLUMN platillo_id SET DEFAULT nextval('public.platillos_platillo_id_seq'::regclass);


--
-- Name: bitacora bitacora_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT bitacora_pkey PRIMARY KEY (bitacora_id);


--
-- Name: configuracion configuracion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_pkey PRIMARY KEY (clave);


--
-- Name: errores errores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.errores
    ADD CONSTRAINT errores_pkey PRIMARY KEY (error_id);


--
-- Name: items_almuerzo items_almuerzo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items_almuerzo
    ADD CONSTRAINT items_almuerzo_pkey PRIMARY KEY (item_almuerzo_id);


--
-- Name: items_desayuno items_desayuno_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items_desayuno
    ADD CONSTRAINT items_desayuno_pkey PRIMARY KEY (item_desayuno_id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (menu_id);


--
-- Name: pedido_items pedido_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_pkey PRIMARY KEY (pedido_item_id);


--
-- Name: pedidos pedidos_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_codigo_key UNIQUE (codigo);


--
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (pedido_id);


--
-- Name: platillos platillos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platillos
    ADD CONSTRAINT platillos_nombre_key UNIQUE (nombre);


--
-- Name: platillos platillos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platillos
    ADD CONSTRAINT platillos_pkey PRIMARY KEY (platillo_id);


--
-- Name: items_almuerzo items_almuerzo_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items_almuerzo
    ADD CONSTRAINT items_almuerzo_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(menu_id) ON DELETE CASCADE;


--
-- Name: items_almuerzo items_almuerzo_platillo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items_almuerzo
    ADD CONSTRAINT items_almuerzo_platillo_id_fkey FOREIGN KEY (platillo_id) REFERENCES public.platillos(platillo_id);


--
-- Name: pedido_items pedido_items_item_almuerzo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_item_almuerzo_id_fkey FOREIGN KEY (item_almuerzo_id) REFERENCES public.items_almuerzo(item_almuerzo_id);


--
-- Name: pedido_items pedido_items_item_desayuno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_item_desayuno_id_fkey FOREIGN KEY (item_desayuno_id) REFERENCES public.items_desayuno(item_desayuno_id);


--
-- Name: pedido_items pedido_items_pedido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT pedido_items_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(pedido_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict dOv418J65LERtMXi3wtEjtF4hf5pQt4hOF6SsJ51EcZ4A4wzUO6MVNw8HncydAf


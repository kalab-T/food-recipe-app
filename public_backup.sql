--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: myuser
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO myuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.bookmarks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recipe_id uuid NOT NULL
);


ALTER TABLE public.bookmarks OWNER TO myuser;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO myuser;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recipe_id uuid NOT NULL,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.comments OWNER TO myuser;

--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.ingredients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid NOT NULL,
    name text NOT NULL,
    quantity text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ingredients OWNER TO myuser;

--
-- Name: likes; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recipe_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.likes OWNER TO myuser;

--
-- Name: media; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.media OWNER TO myuser;

--
-- Name: ratings; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recipe_id uuid NOT NULL,
    rating integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.ratings OWNER TO myuser;

--
-- Name: recipe_categories; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.recipe_categories (
    recipe_id uuid NOT NULL,
    category_id uuid NOT NULL
);


ALTER TABLE public.recipe_categories OWNER TO myuser;

--
-- Name: recipes; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    prep_time integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    image text,
    tags text[]
);


ALTER TABLE public.recipes OWNER TO myuser;

--
-- Name: steps; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid NOT NULL,
    step_number integer NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    "order" integer
);


ALTER TABLE public.steps OWNER TO myuser;

--
-- Name: users; Type: TABLE; Schema: public; Owner: myuser
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO myuser;

--
-- Data for Name: bookmarks; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.bookmarks (id, user_id, recipe_id) FROM stdin;
6f417b06-e020-4217-8be8-4b87c17c026a	450f4af9-7941-4cc7-9567-ee96b35eb06f	9c321328-02d6-46c4-85e2-d1712d3bbc09
0847ca18-2789-489c-960d-cbca8c0ac3b9	450f4af9-7941-4cc7-9567-ee96b35eb06f	19c4ebaa-73a5-42fb-9392-d16999004732
02433da1-5b29-442a-bce8-f0895747545a	450f4af9-7941-4cc7-9567-ee96b35eb06f	43e07b9c-483b-4d48-9954-82c7073b1f9b
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.categories (id, name, created_at, updated_at) FROM stdin;
49e187e6-456b-41a8-9731-7f8ef61d3736	Desserts	2025-04-26 13:29:48.822585	2025-04-26 13:29:48.822585
9c96df6a-6a56-4557-bf71-2770d9925127	breakfast	2025-04-26 13:29:48.822585	2025-04-26 13:29:48.822585
562c1ae0-ed4d-4e41-bc71-634f7ece49ad	lunch	2025-04-26 13:29:48.822585	2025-04-26 13:29:48.822585
bc771f60-b01b-48eb-b9fc-1d5b746bedd1	dinner	2025-04-26 13:29:48.822585	2025-04-26 13:29:48.822585
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.comments (id, user_id, recipe_id, comment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.ingredients (id, recipe_id, name, quantity, created_at, updated_at) FROM stdin;
11bdf699-3bb1-4445-9b4b-4e5ea0bfdc2f	fb08c207-ac33-46c9-a999-c39da45d2d3f	avocado	2	2025-07-14 09:22:56.877601	2025-07-14 09:22:56.877601
2f76e402-25fd-4070-8723-bfd155a1ec18	43e07b9c-483b-4d48-9954-82c7073b1f9b	pinapple	1	2025-08-02 12:05:56.157413	2025-08-02 12:05:56.157413
edac5250-59b9-475a-8b31-9b698889e197	43e07b9c-483b-4d48-9954-82c7073b1f9b	pinapple	1	2025-08-02 12:06:52.251867	2025-08-02 12:06:52.251867
46137701-db14-47fb-a542-3423b396fa64	43e07b9c-483b-4d48-9954-82c7073b1f9b	pinapple	1	2025-08-02 12:06:54.262265	2025-08-02 12:06:54.262265
92625c97-1b55-448f-99f3-6aa6f6b1957a	43e07b9c-483b-4d48-9954-82c7073b1f9b	dfgsdggsd	1	2025-08-02 12:08:10.866101	2025-08-02 12:08:10.866101
613b2f2f-b98f-4b3c-b96e-c82089d90a11	43e07b9c-483b-4d48-9954-82c7073b1f9b	sdfds	2	2025-08-02 12:08:10.866101	2025-08-02 12:08:10.866101
4a68d4b2-70f4-41d5-aa02-c0dafb35d365	673529fb-49bc-4d00-bf6c-86b4d2a9e751	onione	2	2025-08-02 12:12:20.003484	2025-08-02 12:12:20.003484
ee5cd81f-3ce0-4ca2-879e-c003fba80f6d	673529fb-49bc-4d00-bf6c-86b4d2a9e751	spoon butter	1	2025-08-02 12:12:20.003484	2025-08-02 12:12:20.003484
6a6640a2-d4b3-4b37-bd19-f0402b5c1f1e	673529fb-49bc-4d00-bf6c-86b4d2a9e751	onione	2	2025-08-02 12:13:39.331855	2025-08-02 12:13:39.331855
71577830-4b70-4da8-b4f5-22ecb8c70e51	673529fb-49bc-4d00-bf6c-86b4d2a9e751	spoon butter	1	2025-08-02 12:13:39.331855	2025-08-02 12:13:39.331855
e7a5b3ec-2328-454f-8893-8d358580fd25	673529fb-49bc-4d00-bf6c-86b4d2a9e751	ጥቅል ጎመን	1	2025-08-02 12:13:39.331855	2025-08-02 12:13:39.331855
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.likes (id, user_id, recipe_id, created_at) FROM stdin;
89c1b9a9-c804-4970-a723-a07dc826b3e0	450f4af9-7941-4cc7-9567-ee96b35eb06f	673529fb-49bc-4d00-bf6c-86b4d2a9e751	2025-08-06 16:19:33.032679
6ce579ee-4e29-4da8-aef2-7e73eb1dde34	9b92ba31-d88f-417b-bb4e-67f83db022f9	9c321328-02d6-46c4-85e2-d1712d3bbc09	2025-07-24 12:35:09.445596
d4fc45eb-4987-4953-ab8a-6c685a0c79be	9b92ba31-d88f-417b-bb4e-67f83db022f9	fb08c207-ac33-46c9-a999-c39da45d2d3f	2025-07-24 12:36:16.905674
1996366f-768a-40dd-b468-fb0a36fcd2c7	450f4af9-7941-4cc7-9567-ee96b35eb06f	9c321328-02d6-46c4-85e2-d1712d3bbc09	2025-07-28 09:25:15.67608
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.media (id, recipe_id, file_url, file_type, is_featured, created_at) FROM stdin;
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.ratings (id, user_id, recipe_id, rating, created_at) FROM stdin;
\.


--
-- Data for Name: recipe_categories; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.recipe_categories (recipe_id, category_id) FROM stdin;
de73106f-b4b3-4175-9b38-e0fa93cac0d6	9c96df6a-6a56-4557-bf71-2770d9925127
b1d72b7b-52dd-4ef8-97cf-ff8f401fcb28	9c96df6a-6a56-4557-bf71-2770d9925127
fb08c207-ac33-46c9-a999-c39da45d2d3f	562c1ae0-ed4d-4e41-bc71-634f7ece49ad
19c4ebaa-73a5-42fb-9392-d16999004732	562c1ae0-ed4d-4e41-bc71-634f7ece49ad
9c321328-02d6-46c4-85e2-d1712d3bbc09	49e187e6-456b-41a8-9731-7f8ef61d3736
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.recipes (id, user_id, title, description, prep_time, created_at, updated_at, image, tags) FROM stdin;
673529fb-49bc-4d00-bf6c-86b4d2a9e751	450f4af9-7941-4cc7-9567-ee96b35eb06f	በየአይነት	very sweet shiro	\N	2025-08-02 12:12:20.003484	2025-08-02 12:12:20.003484	http://localhost:8080/images/aynet.jpg	\N
de73106f-b4b3-4175-9b38-e0fa93cac0d6	c6a14c8e-aec7-4d15-85d7-b97b8607be09	Spicy Chickpea Stew	A warm and hearty stew made with chickpeas, tomatoes, and Moroccan spices.	\N	2025-05-17 09:05:15.998663	2025-05-17 09:05:15.998663	https://i.imgur.com/6aOPSz0.jpeg	\N
b1d72b7b-52dd-4ef8-97cf-ff8f401fcb28	c6a14c8e-aec7-4d15-85d7-b97b8607be09	Berry Smoothie Bowl	A refreshing smoothie bowl topped with granola, banana slices, and fresh berries.	\N	2025-05-17 09:05:15.998663	2025-05-17 09:05:15.998663	https://i.imgur.com/0qrs3j9.jpeg	\N
19c4ebaa-73a5-42fb-9392-d16999004732	c6a14c8e-aec7-4d15-85d7-b97b8607be09	Grilled Vegetable Skewers	Colorful skewers loaded with grilled zucchini, bell peppers, and mushrooms.	\N	2025-05-17 09:05:15.998663	2025-05-17 09:05:15.998663	https://i.imgur.com/5CUlfpA.jpeg	\N
9c321328-02d6-46c4-85e2-d1712d3bbc09	450f4af9-7941-4cc7-9567-ee96b35eb06f	Chocolate Lava Cake	A warm, rich chocolate cake with a gooey molten center. Best served with vanilla ice cream.	\N	2025-05-20 18:28:23.19518	2025-05-20 18:28:23.19518	https://images.unsplash.com/photo-1600891964599-f61ba0e24092	\N
fb08c207-ac33-46c9-a999-c39da45d2d3f	c6a14c8e-aec7-4d15-85d7-b97b8607be09	Avocado Toast with Poached Egg	Toasted bread topped with mashed avocado, chili flakes, and a perfectly poached egg.	\N	2025-05-17 09:05:15.998663	2025-05-17 09:05:15.998663	https://images.unsplash.com/photo-1551183053-bf91a1d81141	{spicy,quick,vegan}
43e07b9c-483b-4d48-9954-82c7073b1f9b	450f4af9-7941-4cc7-9567-ee96b35eb06f	Strawberry Cheesecake	A creamy cheesecake with a buttery graham cracker crust topped with fresh strawberries and glaze.	\N	2025-05-20 18:28:23.19518	2025-05-20 18:28:23.19518	https://i.imgur.com/tDNkT6u.jpeg	\N
\.


--
-- Data for Name: steps; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.steps (id, recipe_id, step_number, description, created_at, updated_at, "order") FROM stdin;
c6a14c8e-aec7-4d15-85d7-b97b8607be09	fb08c207-ac33-46c9-a999-c39da45d2d3f	1	wash the avocadoes properly	2025-05-19 11:04:20.467814	2025-05-19 11:04:20.467814	1
64104d88-88db-4012-91e9-99c37b0e0427	fb08c207-ac33-46c9-a999-c39da45d2d3f	2	after washing the avocado properly ...	2025-07-14 09:25:18.066653	2025-07-14 09:25:18.066653	\N
6566c938-e484-4889-a615-0439ab9fb3ef	fb08c207-ac33-46c9-a999-c39da45d2d3f	3	kdsfjkjfdsljldk	2025-07-14 09:51:26.190261	2025-07-14 09:51:26.190261	\N
6decbb0f-a765-416d-b0a9-8fc7bb598cb7	43e07b9c-483b-4d48-9954-82c7073b1f9b	1	use the pinapple	2025-08-02 12:05:56.157413	2025-08-02 12:05:56.157413	\N
eac8e8c6-2d45-4595-a889-5cd72f599d69	43e07b9c-483b-4d48-9954-82c7073b1f9b	1	use the pinapple	2025-08-02 12:06:52.251867	2025-08-02 12:06:52.251867	\N
33d5112a-fc4b-455f-ae67-5bfa134dfe8a	43e07b9c-483b-4d48-9954-82c7073b1f9b	1	use the pinapple	2025-08-02 12:06:54.262265	2025-08-02 12:06:54.262265	\N
123727d5-d821-40f8-a352-1a777abf833a	43e07b9c-483b-4d48-9954-82c7073b1f9b	1	sffwefrwef	2025-08-02 12:08:10.866101	2025-08-02 12:08:10.866101	\N
f396aecc-1bc3-4e9c-8fae-1ef0b7244f7b	43e07b9c-483b-4d48-9954-82c7073b1f9b	2	sfwefrwef	2025-08-02 12:08:10.866101	2025-08-02 12:08:10.866101	\N
0e604f43-c7fa-412b-b773-c7a1bd862a78	673529fb-49bc-4d00-bf6c-86b4d2a9e751	1	start with chopping the onione	2025-08-02 12:12:20.003484	2025-08-02 12:12:20.003484	\N
d20588fd-8505-42b2-9807-85de8f728875	673529fb-49bc-4d00-bf6c-86b4d2a9e751	1	start with chopping the onione	2025-08-02 12:13:39.331855	2025-08-02 12:13:39.331855	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: myuser
--

COPY public.users (id, name, email, password, created_at, updated_at) FROM stdin;
02580a28-d420-4209-be17-c9a035d14fe1	Jane Smith	jane.smith@example.com	$2a$10$0eH2IaDOJ/NV.THZbNwhje7guvY9/GUUjbV2y1bxlOS4Hk3mPOlgW	2025-05-15 10:39:01.841164	2025-05-17 11:19:34.826413+00
68173ca5-d35b-421a-b72b-7a44d51c5198	Alice	alice@example.com	$2a$10$Mvk8zHG9XvrwIgL9NHIpO.CQ.qHAv33T.1wkiI/22Hft7pcso/dvm	2025-05-16 13:01:44.447774	2025-05-17 11:19:34.826413+00
c6a14c8e-aec7-4d15-85d7-b97b8607be09	tesfaneh Bersa	ktesfaneh01@gmail.com	$2a$10$4GS/a3.8OX5WB0suyl7B/./OEbWnSsaJFcWpBCU.16ZFPqus9uzIC	2025-05-16 13:21:16.653271	2025-05-17 11:19:34.826413+00
03a1dc08-160f-4853-9ece-18797be47442	Tesst	ttest@example.com	$2a$12$Qkws5H1m15GrZHN5DtcBcODGKZ5KCzTt.TeKCEoXaVWLcp/zP40Im	2025-06-06 13:33:07.39342	2025-06-06 13:33:07.39342+00
96d7c3d3-16ff-43a5-8192-7754bf835060	Testuser	testuser@example.com	$2a$12$1LmKulQiSR71FlryuUgRbupT7hF3By0cuE0tQcJ7YQ6M4t9HM/89y	2025-06-10 09:52:58.222677	2025-06-10 09:52:58.222677+00
ffc7a8de-a9b2-4ef3-af4d-ae6d57dc9ae8	new user	newuser@gmail.com	$2a$12$XGd5GkHCf9KPDFN5CPt90.1dVd3Ch1mgCt7yIJaHbj3Wu3UHHXtbe	2025-06-17 10:18:24.805981	2025-06-17 10:18:24.805981+00
77f7f3af-9840-4e1e-9bdd-0785129ab752	kal T	ktesfaneh2@gmail.com	$2a$12$LxaEH4wzxTs3Fx/qZ3a9b.yv0SLT6Fjic1UQGm7dt2yCtrKpbYvOa	2025-05-19 03:08:15.872669	2025-05-19 04:40:58.650843+00
9949ace2-eb44-4c40-9364-5568a4701368	yyyyyyyy	ktesfaneh00@gmail.com	$2a$12$z0Au/S.UO0KTMLbvGep1..dBb51mSrgvUieio0j7dNXZKqy7hgNc.	2025-05-20 08:28:39.98861	2025-05-20 08:28:39.98861+00
371369c4-c577-4c03-9575-34acb98975dc	melat Getachew	ktesfaneh@gmail.com	$2a$12$978VClej2k6X0jFVFCXMfOFiCpzOFP03QJ44UTYKWK6OWNnO1fFbe	2025-05-20 09:05:55.49345	2025-05-20 09:08:52.113575+00
450f4af9-7941-4cc7-9567-ee96b35eb06f	yacobe 	ktesfaneh0@gmail.com	$2a$12$LxaEH4wzxTs3Fx/qZ3a9b.yv0SLT6Fjic1UQGm7dt2yCtrKpbYvOa	2025-05-17 09:28:23.069116	2025-05-20 09:21:18.994007+00
9b92ba31-d88f-417b-bb4e-67f83db022f9	old user	olduser@gmail.com	$2a$12$GwA1VwQqjQyk/aPig1yW2e1jsf.WR4bl1jCBOkQ32RhB6ADsi30wC	2025-07-08 08:43:21.817569	2025-07-08 08:43:21.817569+00
9a244c20-031f-462d-a56f-15db31919f5d	kaka 	ktesfaneh02@gmail.com	$2a$12$jivWuIdoWFgJ3OD9Ho4Fm.cBXqhcm0KmadaNJOq5ZsXw5ADDQPAu.	2025-05-19 07:56:45.474111	2025-05-20 09:28:47.212106+00
b04de5f6-c239-4539-9c14-8a183ec5127f	abebe	abebe@gmail.com	$2a$12$GroRZ4VmpLtoJtP10E.Dout7vFUXA7We55XkkiYjV69ectFSWKuPC	2025-05-22 00:56:45.13983	2025-05-22 00:56:45.13983+00
19e74b92-8063-4561-a4d0-62cbc23539c1	Belte 	belete@gmail.com	$2a$12$LxaEH4wzxTs3Fx/qZ3a9b.yv0SLT6Fjic1UQGm7dt2yCtrKpbYvOa	2025-05-22 04:56:19.052754	2025-05-22 04:57:27.919012+00
b8b67739-256a-476a-9924-e01f6adae868	Test User	test@example.com	$2a$12$D6IeNjx/GKIbED5xLoTvZ.eJcvQ6NGdOlaOHH2PNeqFEnaUeJME.u	2025-06-02 13:33:20.235544	2025-06-02 13:33:20.235544+00
e3149e50-880a-4432-a986-f992e64aa092	sample	sample@gmail.com	$2a$12$jHOWQK/Qz3vmMNefwK3DYe2w6bqSBqGJG69On8DMbbb48DzH2B0by	2025-06-02 13:45:05.169143	2025-06-02 13:45:05.169143+00
0ea36ef6-2c54-486d-9749-49a951823881	Kalab	kalab@example.com	$2a$12$9OrOGLzGTJqr2gMKWvP8vOJ20cOySUr/zo5I4Wq1rtcLyjrrC3xau	2025-07-10 10:09:37.612391	2025-07-10 10:09:37.612391+00
a7df3bce-6d1d-4820-addb-a273f9d6d24f	new user	newuser123@example.com	$2a$12$4ine9QVBUJrBtwnVbaNwj.zBS3PMzuxLmLkh5B5vmDygbn4ruRr3a	2025-07-10 10:51:35.67803	2025-07-10 10:51:35.67803+00
b5a04bec-a30f-4276-ac27-c315ba356b0e	old userr	oolduser@gmail.com	$2a$12$tClFiloa6zNsvbZoR5/0vObi0Z52pNYTRhh23fI.sEwaUpyuept0u	2025-07-11 10:24:34.856769	2025-07-11 10:24:34.856769+00
\.


--
-- Name: bookmarks bookmarks_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: recipe_categories recipe_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.recipe_categories
    ADD CONSTRAINT recipe_categories_pkey PRIMARY KEY (recipe_id, category_id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: steps steps_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT steps_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users trigger_set_updated_at; Type: TRIGGER; Schema: public; Owner: myuser
--

CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: recipe_categories fk_category; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.recipe_categories
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: steps fk_recipe; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.steps
    ADD CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_categories fk_recipe; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.recipe_categories
    ADD CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: bookmarks fk_recipe; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: likes fk_recipe; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: comments fk_recipe; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: ratings fk_recipe; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: media fk_recipe; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: ingredients fk_recipe_ingredient; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT fk_recipe_ingredient FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipes fk_user; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookmarks fk_user; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: likes fk_user; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments fk_user; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ratings fk_user; Type: FK CONSTRAINT; Schema: public; Owner: myuser
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



  create table "public"."course_assistants" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "course_id" uuid not null,
    "assistant_id" uuid not null
      );


alter table "public"."course_assistants" enable row level security;


  create table "public"."programs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "description" text
      );


alter table "public"."programs" enable row level security;

alter table "public"."enrollments" alter column "student_id" set not null;

alter table "public"."terms" add column "id_program" uuid not null;

CREATE UNIQUE INDEX course_assistants_pkey ON public.course_assistants USING btree (id);

CREATE UNIQUE INDEX programs_pkey ON public.programs USING btree (id);

alter table "public"."course_assistants" add constraint "course_assistants_pkey" PRIMARY KEY using index "course_assistants_pkey";

alter table "public"."programs" add constraint "programs_pkey" PRIMARY KEY using index "programs_pkey";

alter table "public"."course_assistants" add constraint "course_assistants_assistant_id_fkey" FOREIGN KEY (assistant_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."course_assistants" validate constraint "course_assistants_assistant_id_fkey";

alter table "public"."course_assistants" add constraint "course_assistants_course_id_fkey" FOREIGN KEY (course_id) REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."course_assistants" validate constraint "course_assistants_course_id_fkey";

alter table "public"."terms" add constraint "terms_id_program_fkey" FOREIGN KEY (id_program) REFERENCES public.programs(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."terms" validate constraint "terms_id_program_fkey";

grant delete on table "public"."course_assistants" to "anon";

grant insert on table "public"."course_assistants" to "anon";

grant references on table "public"."course_assistants" to "anon";

grant select on table "public"."course_assistants" to "anon";

grant trigger on table "public"."course_assistants" to "anon";

grant truncate on table "public"."course_assistants" to "anon";

grant update on table "public"."course_assistants" to "anon";

grant delete on table "public"."course_assistants" to "authenticated";

grant insert on table "public"."course_assistants" to "authenticated";

grant references on table "public"."course_assistants" to "authenticated";

grant select on table "public"."course_assistants" to "authenticated";

grant trigger on table "public"."course_assistants" to "authenticated";

grant truncate on table "public"."course_assistants" to "authenticated";

grant update on table "public"."course_assistants" to "authenticated";

grant delete on table "public"."course_assistants" to "service_role";

grant insert on table "public"."course_assistants" to "service_role";

grant references on table "public"."course_assistants" to "service_role";

grant select on table "public"."course_assistants" to "service_role";

grant trigger on table "public"."course_assistants" to "service_role";

grant truncate on table "public"."course_assistants" to "service_role";

grant update on table "public"."course_assistants" to "service_role";

grant delete on table "public"."programs" to "anon";

grant insert on table "public"."programs" to "anon";

grant references on table "public"."programs" to "anon";

grant select on table "public"."programs" to "anon";

grant trigger on table "public"."programs" to "anon";

grant truncate on table "public"."programs" to "anon";

grant update on table "public"."programs" to "anon";

grant delete on table "public"."programs" to "authenticated";

grant insert on table "public"."programs" to "authenticated";

grant references on table "public"."programs" to "authenticated";

grant select on table "public"."programs" to "authenticated";

grant trigger on table "public"."programs" to "authenticated";

grant truncate on table "public"."programs" to "authenticated";

grant update on table "public"."programs" to "authenticated";

grant delete on table "public"."programs" to "service_role";

grant insert on table "public"."programs" to "service_role";

grant references on table "public"."programs" to "service_role";

grant select on table "public"."programs" to "service_role";

grant trigger on table "public"."programs" to "service_role";

grant truncate on table "public"."programs" to "service_role";

grant update on table "public"."programs" to "service_role";



-- Habilita la extensión vector si no está habilitada
create extension if not exists vector;

-- Crea la tabla (si no existe) o asegura columna embedding
alter table products add column if not exists embedding vector(1536);

-- Función Trigger que llama a la Edge Function
create or replace function public.handle_new_product()
returns trigger as $$
begin
  perform
    net.http_post(
      url := 'https://PROJECT_REF.supabase.co/functions/v1/embed-product',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
      body := jsonb_build_object(
        'record', row_to_json(new)
      )
    );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_product_created on products;
create trigger on_product_created
  after insert on products
  for each row execute procedure public.handle_new_product();

-- Trigger for updates (optional text change config)
drop trigger if exists on_product_updated on products;
create trigger on_product_updated
  after update of name, description on products
  for each row execute procedure public.handle_new_product();

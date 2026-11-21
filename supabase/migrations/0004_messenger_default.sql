alter table public.settings
  alter column store_messenger_url set default 'https://www.facebook.com/oxbowlfeedbackandconcern21';

update public.settings
  set store_messenger_url = 'https://www.facebook.com/oxbowlfeedbackandconcern21'
  where id = 1;

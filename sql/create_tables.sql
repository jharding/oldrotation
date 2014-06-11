CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email varchar(254) NOT NULL,
  password char(60) NOT NULL,
  UNIQUE(email)
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY, 
  summary varchar(128) NOT NULL
);

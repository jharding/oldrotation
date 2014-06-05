Database Details
----------------

**user**: `push`
**database**: `push_dev`

Common Tasks
------------

```sh
# create user
psql --file=create_user.sql

# create database
psql --file=create_database.sql 

# create tables
psql --dbname=push_dev --username=push --file=create_tables.sql

# connect to database
psql --dbname=push_dev --username=push
```

export const userSchema = 
    `CREATE TABLE IF NOT EXISTS users (
        id int NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        email varchar(100) NOT NULL,
        password varchar(100) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY email_UNIQUE (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;`
;
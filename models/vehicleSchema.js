export const vehicleSchema = 
    `CREATE TABLE IF NOT EXISTS vehicles_table (
        id int NOT NULL AUTO_INCREMENT,
        userId int NOT NULL,
        name varchar(100) DEFAULT NULL,
        brand varchar(45) NOT NULL,
        model varchar(45) NOT NULL,
        version varchar(45) DEFAULT NULL,
        color varchar(45) NOT NULL,
        licensePlate varchar(10) DEFAULT NULL,
        mileage int DEFAULT NULL,
        imageUrl varchar(255) DEFAULT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;`
;
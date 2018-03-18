# PubMiner #

### Instructions for Running Locally ###
 - Install `NodeJS` and `npm` (node package manager). The installer at [nodejs.org](https://nodejs.org) will handle both of those for you
 - From the project directory, type `npm install` to install the project dependencies.
 - From the project directory, type `npm start` to start the server on port `8081`.If you'd like to change the port to something different, you can modify the `bin\www` file
 - In your browser, navigate to http:\\localhost:8081

 ### Instruction For Running PostgreSQL ###
 -- [Install Docker Compose](https://docs.docker.com/compose/install/#install-compose) 
 -- Run `sudo docker up` from pubminer-ui-investigation directory 
 -- To interact directly with db, run `psql -h localhost -p 5432 -d pubminer -U root_user --password root_pw`
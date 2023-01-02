# CS3099 Team 15

## Installation

The easiest way to get the solution up and running is to use the podman script provided in 
`production/podman/run_production_podman.sh <port-number>`. For this to work you must be in the production folder.

There are few server dependencies required for the installation and thus we recommend running it from the podman pod. 

The dependencies that are required are:
- mongodb
- redis

The script takes command line arguments of the port to expose the pod to. 
It defaults to cs3099user15 userid. We would recommend running it on your user id of your account so that it does not interfere with other processes. You could also run it on a separate lab machine.

# Running Tests

- To run the tests you can stop the container with Ctrl + C.
- Then you can create an interactive session in the container using the command 
- `podman exec -it code_review bash`
- To run the backend tests, navigate to the backend folder and run `npm run test_unit` for the unit tests and `nm run test_integration` to
run the integration tests.

## Roles
- Initially when creating an account you will be assigned the user role.
- You won't be able to do much other than upload subissions, create private discussions
and edit your profile
- Therefore, you will have to assign yourself a role initially by giving a user a role
directly in the database.
- To do this you can do the following:
- `podman exec -it mongo_cs3099 mongosh`
- `use code_review`
- `db.users.updateOne({id: '<youruserid>'}, {$set: {role: 3}})'`
- This gives you all privileges (both admin and editor roles)

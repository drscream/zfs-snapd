# zfs-snapd

## Config

Object of repository objects.
Each repositroy has a <code>fs</code> and <code>password</code> key.

Example:

	{
	        "test": {
	                "fs": "pool/test",
	                "password": "qwe123"
	        }
	}

## API

### list: GET /

Returns: json string list

Example:

	curl -u test:qwe123 http://repo.example.com:8080
	["testing-20140510"]

### create: POST /

Parameters:

- name

Returns: json status object

Example:

	curl -u test:qwe123 -X POST -d "name=x" http://repo.example.com:8080
	{"status":"success"}

### destroy: DELETE /

Parameters:

- name

Returns: json status object

Example:

	curl -u test:qwe123 -X DELETE -d "name=x" http://repo.example.com:8080
	{"status":"success"}

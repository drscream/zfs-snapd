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

##### Success Response: json string list
	
- Code: 200
- Content: `["testing-20140510"]`

##### Error Response: json list with error details

- Code: 500
- Content: `{"status":"error","error":{"killed":false,"code":1,"signal":null},"message":"Error: Command failed: Unable to open /dev/zfs: Permission denied.; Unable to open /dev/zfs: Permission denied."}`

##### Sample Call:

	curl -u test:qwe123 http://repo.example.com:8080
	["testing-20140510"]

### create: POST /

##### Data Params:

- name

##### Success Response: json status object

- Code: 200
- Content: `{"status":"success"}`

##### Error Response: json list with error details

- Code: 500 or 406
- Content: `{"status":"error","error":"invalid name"}`

##### Sample Call:

	curl -u test:qwe123 -X POST -d "name=x" http://repo.example.com:8080
	{"status":"success"}

### destroy: DELETE /

##### Data Params:

- name

##### Success Response: json status object

- Code: 200
- Content: `{"status":"success"}`

##### Error Response: json list with error details

- Code: 500 or 406
- Content: `{"status":"error","error":{"killed":false,"code":1,"signal":null},"message":"Error: Command failed: could not find any snapshots to destroy; check snapshot names."}`

##### Sample Call:

	curl -u test:qwe123 -X DELETE -d "name=x" http://repo.example.com:8080
	{"status":"success"}

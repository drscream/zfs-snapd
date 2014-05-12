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

### list: GET /snapshot

##### Success Response: json string list
	
- Code: 200
- Content: `["testing-20140510"]`

##### Error Response: json list with error details

- Code: 500
- Content: `{"status":"error","error":{"killed":false,"code":1,"signal":null},"message":"Error: Command failed: Unable to open /dev/zfs: Permission denied.; Unable to open /dev/zfs: Permission denied."}`

##### Sample Call:

	curl -u test:qwe123 http://repo.example.com:8080/snapshot
	["testing-20140510"]

### create: POST /snapshot

##### Data Params:

- name

##### Success Response: json status object

- Code: 200
- Content: `{"status":"success"}`

##### Error Response: json list with error details

- Code: 500 or 406
- Content: `{"status":"error","error":"invalid name"}`

##### Sample Call:

	curl -u test:qwe123 -X POST -d "name=x" http://repo.example.com:8080/snapshot
	{"status":"success"}

### destroy: DELETE /snapshot

##### Data Params:

- name

##### Success Response: json status object

- Code: 200
- Content: `{"status":"success"}`

##### Error Response: json list with error details

- Code: 500 or 406
- Content: `{"status":"error","error":{"killed":false,"code":1,"signal":null},"message":"Error: Command failed: could not find any snapshots to destroy; check snapshot names."}`

##### Sample Call:

	curl -u test:qwe123 -X DELETE -d "name=x" http://repo.example.com:8080/snapshot
	{"status":"success"}


### list: GET /alias

##### Success Response: json string dict

- Code: 200
- Content: `{"testing":"1"}`

##### Error Response: json list with error details

- Code: 500
- Content: `{"status":"error","error":{"killed":false,"code":1,"signal":null},"message":"Error: Command failed: Unable to open /dev/zfs: Permission denied.; Unable to open /dev/zfs: Permission denied."}`

##### Sample Call:

	curl -u test:qwe123 http://repo.example.com:8080/alias
	{"testing":"1"}

### create: POST /alias

##### Data Params:

- source (existing zfs snapshot)
- target (preferred alias name)

##### Success Response: json status object

- Code: 200
- Content: `{"status":"success"}`

##### Error Response: json list with error details

- Code: 500
- Content: `{"status":"error","error":{"errno":47,"code":"EEXIST","path":"/pool/mirror-ubuntu/.zfs/snapshot/1"},"message":"Error: EEXIST, symlink '/pool/mirror-ubuntu/.zfs/snapshot/1'"}`

##### Sample Call:

	curl -u test:qwe123 -X POST -d "source=1" -d "target=testing" http://repo.example.com:8080/alias
	{"status":"success"}

### destroy: DELETE /alias

##### Data Params:

- name

##### Success Response: json status object

- Code: 200
- Content: `{"status":"success"}`


##### Error Response: json list with error details

- Code: 500
- Content: `{"status":"error","error":{"errno":34,"code":"ENOENT","path":"/pool/mirror-ubuntu/.alias/testing"},"message":"Error: ENOENT, unlink '/pool/mirror-ubuntu/.alias/testing'"}`

##### Sample Call:

	curl -u test:qwe123 -X DELETE -d "name=testing" http://repo.example.com:8080/alias

.PHONY: prep
prep:
	cp -r deploy/.deta dist/
	cp deploy/main.py dist/
	cp deploy/requirements.txt dist


.PHONY: sync
sync:
	rm -r deploy/.deta && cp -r dist/.deta deploy/
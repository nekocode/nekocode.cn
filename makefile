all: resume_pdf blog

resume_pdf:
	make -C resume
	cp resume/resume.pdf static/

blog:
	hugo server

all: resume_pdf project_gallery blog

resume_pdf:
	make -C resume
	cp resume/resume.pdf static/

project_gallery:
	rm -rf static/project-gallery
	cp -r project-gallery static/
	rm -f static/project-gallery/.gitignore static/project-gallery/token static/project-gallery/*.sh static/project-gallery/data/*.py static/project-gallery/*.md

blog:
	hugo

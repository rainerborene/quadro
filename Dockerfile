FROM ruby:2.2.0

ENV GEM_HOME /ruby_gems/2.1
ENV PATH /ruby_gems/2.1/bin:$PATH

RUN echo 'deb http://http.us.debian.org/debian/ unstable non-free contrib main' >> /etc/apt/sources.list
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs phantomjs sudo

RUN useradd -d /home/app -m -s /bin/bash app
RUN echo "app ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

WORKDIR /app

FROM python:3.10

RUN mkdir /app
WORKDIR /app

RUN apt-get update \
&& apt-get upgrade -y \
&& apt-get install -y gdal-bin \
&& apt-get clean \
&& apt autoremove -y \
&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD [ "flask", "run", "--host", "0.0.0.0", "--port", "5000"]

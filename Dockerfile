FROM python:3.12-slim
WORKDIR /app
COPY artifacts/tg-python/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY artifacts/tg-python/ .
EXPOSE 5000
CMD ["python", "server.py"]

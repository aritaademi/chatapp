# # Step 1: Build React app
# FROM node:20 AS build
# WORKDIR /app
# COPY . .
# RUN npm install
# RUN npm run build

# # Step 2: Serve React app with nginx
# FROM nginx:stable-alpine
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]


# # Step 1: Build React app
# FROM node:20 AS build
# WORKDIR /app

# # Accept the API URL from docker-compose via build ARG
# ARG REACT_APP_API_URL
# ENV REACT_APP_API_URL=$REACT_APP_API_URL

# COPY . .

# RUN npm install

# # This line will embed REACT_APP_API_URL into the build
# RUN npm run build

# # Step 2: Serve React app with nginx
# FROM nginx:stable-alpine
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]


FROM node:20 AS build
WORKDIR /app

# Declare the build argument here
ARG REACT_APP_API_URL

# Copy only package files first and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Set the environment variable for the build process
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the React app (this reads process.env.REACT_APP_API_URL)
RUN npm run build

# Serve the built app with nginx
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Quandl Timeseries datasets with Metabase Visualization

This quickstart, for the most part, consists of two of Hasura's microservices:

1. quandl: Fetches and stores data from [Quandl](https://www.quandl.com/) and stores them in Hasura

2. metabase: Runs [Metabase](https://www.metabase.com/) on this service which can be used to visualise the data fetched from quandl

Follow along below to get the setup working on your cluster and also to understand how this quickstart works.

## Prerequisites

* Ensure that you have the [hasura cli](https://docs.hasura.io/0.15/manual/install-hasura-cli.html) tool installed on your system.

```sh
$ hasura version
```

Once you have installed the hasura cli tool, login to your Hasura account

```sh
$ # Login if you haven't already
$ hasura login
```

* You should have [Node.js](https://nodejs.org/en/) installed on your system, you can check this by:

```sh
# To check the version of node installed
$ node -v

# Node comes with npm. To check the version of npm installed
$ npm -v
```

* You should also have [git](https://git-scm.com) installed.

```sh
$ git --version
```

## Getting started

```sh
$ # Run the quickstart command to get the project
$ hasura quickstart anirudhmurali/quandl-metabase-time-series

$ # Navigate into the Project
$ cd quandl-metabase-time-series
```

## Quandl

Before you begin, head over to [Quandl](https://www.quandl.com/) and select the dataset you would like to use. In this case, we are going with the `Gold Price: London Fixing` from London Bullion Market Association dataset. Keep in mind the `Vendor Code` (In this case it is, `LBMA`) and `Datatable Code` (`GOLD` in this case) for the dataset.

![Quandl 1](https://raw.githubusercontent.com/anirudhmurali/Quandl-Metabase/master/quandl1.png "Quandl 1")

![Quandl 2](https://raw.githubusercontent.com/anirudhmurali/Quandl-Metabase/master/quandl2.png "Quandl 2")

To fetch the data you need to have an `API Key` which you can get by getting an account with Quandl.

![Quandl 3](https://raw.githubusercontent.com/anirudhmurali/Quandl-Metabase/master/quandl3.png "Quandl 3")

Keep a note of your `API Key`.

### Adding the Quandl `API Key` to Hasura secrets

Sensitive data like API keys, tokens etc should be stored in Hasura secrets and then accessed as an environment variable in your app. Do the following to add your Quandl API Key to Hasura secrets.

```sh
$ # Paste the following into your terminal
$ # Replace <API-KEY> with the API Key you got from Quandl
$ hasura secret update quandl.api.key <API-KEY>
```

This value is injected as an environment variable (QUANDL_API_KEY) to the quandl service like so:

```yaml
env:
- name: QUANDL_API_KEY
  valueFrom:
  secretKeyRef:
    key: quandl.api.key
    name: hasura-secrets
```

Check your `k8s.yaml` file inside `microservices/quandl/app` to check out the whole file.

Next, let's deploy the app onto your cluster.

## Deploy app

`Note: Deploy will not work if you have not followed the previous steps correctly`

```sh
$ # Ensure that you are in the quandl-metabase directory
$ # Git add, commit & push to deploy to your cluster
$ git add .
$ git commit -m 'First commit'
$ git push hasura master
```

Once the above commands complete successfully, your cluster will have two services `metabase` and `quandl` running. To get their URLs

```sh
$ # Run this in the quandl-metabase directory
$ hasura microservice list
```

```sh
• Getting microservices...
• Custom microservices:
NAME       STATUS    INTERNAL-URL       EXTERNAL-URL
metabase   Running   metabase.default   http://metabase.boomerang68.hasura-app.io
quandl     Running   quandl.default     http://quandl.boomerang68.hasura-app.io

• Hasura microservices:
NAME            STATUS    INTERNAL-URL           EXTERNAL-URL
auth            Running   auth.hasura            http://auth.boomerang68.hasura-app.io
data            Running   data.hasura            http://data.boomerang68.hasura-app.io
filestore       Running   filestore.hasura       http://filestore.boomerang68.hasura-app.io
gateway         Running   gateway.hasura
le-agent        Running   le-agent.hasura
notify          Running   notify.hasura          http://notify.boomerang68.hasura-app.io
platform-sync   Running   platform-sync.hasura
postgres        Running   postgres.hasura
session-redis   Running   session-redis.hasura
sshd            Running   sshd.hasura
```

You can access the services at the `EXTERNAL-URL` for the respective service.

## Exploring the data

Currently our database has not gotten any data from quandl. You can head over to your `api console` to check this out. It will have one table called `quandl_checkpoint` which stores the current offset at which the data in Hasura is stored.

```sh
$ # Run this in the quandl-metabase directory
$ hasura api-console
```

![Quandl4](https://raw.githubusercontent.com/anirudhmurali/Quandl-Metabase/master/quandl4.png "Quandl4")

Let's use our `quandl` service to insert some data. To do this:

```
POST https://quandl.<CLUSTER-NAME>.hasura-app.io/add_data // remember to replace <CLUSTER-NAME> with your own cluster name (In this case, http://quandl.boomerang68.hasura-app.io/add_data)

{
    "quandl_code": "LBMA/GOLD"
}
```

You can use a HTTP client of your choosing to make this request. Alternatively, you can also use the `API Explorer` provided by the Hasura `api console` to do this.

![Quandl5](https://raw.githubusercontent.com/anirudhmurali/Quandl-Metabase/master/quandl5.png "Quandl5")

Once you have successfully made the above API call. Head back to your `API console` and you will see a new table called `lbma_gold` with about 12600 rows of data in it.

## Visualising the data using Metabase

### Navigate to Metabase

Head over to the EXTERNAL-URL of your `metabase` service.

![Metabase 1](https://raw.githubusercontent.com/anirudhmurali/Quandl-Metabase/master/metabase1.png "Metabase 1")

### SignUp

Enter your details. Click on `Add my data later` in Step 2 and complete the sign up process

### Metabase Dashboard

You will now reach your `Dashboard`

![Metabase 2](https://raw.githubusercontent.com/anirudhmurali/Quandl-Metabase/master/metabase2.png "Metabase 2")

### Connecting Hasura's database to Metabase

Now, let's connect our Hasura database to `metabase`

To get your `Database password`, go to your terminal:

```sh
$ # Run this in the quandl-metabase directory
$ hasura secret list
```

In the list that comes up, the value for `postgres.password` is your `Database password`. Paste this in the form and click on `Save`.

![Metabase 3](https://raw.githubusercontent.com/anirudhmurali/Quandl-Metabase/master/metabase3.png "Metabase 3")

Your database is now integrated.

### Visualising the data

Click on `New question` and select `Custom`. In the `Data` dropdown, select `hasuradb` `Public` and then search for `Lb Ma Gold`

![Metabase 4](https://raw.githubusercontent.com/anirudhmurali/Quandl-Metabase/master/metabase4.png "Metabase 4")

Play with different types of visualizations to change the data display type:

![Metabase 5](https://raw.githubusercontent.com/anirudhmurali/Quandl-Metabase/master/metabase5.png "Metabase 5")

And that's it, get more time-series datasets from Quandl, add to the database and draw conclusions from the visualizations!






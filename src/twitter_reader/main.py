import json
from datetime import datetime
import os
import urllib3
import urllib
import boto3


from aws_lambda_powertools import Logger



logger = Logger()
dynamodb_client = boto3.client('dynamodb', region_name="eu-south-2")
s3 = boto3.resource('s3')

class TwitterRequest:
    def __init__(self, query, queryId, latitude, longitude, distance, location, locationId, lastExecution):
        self.query = query
        self.queryId = queryId
        self.latitude = latitude
        self.longitude = longitude 
        self.distance = distance
        self.location = location
        self.locationId = locationId
        self.lastExecution = lastExecution


class TwitterResponse:
    def __init__(self, wordId,word, locationId,location,textList, lastExecution):
        self.textList = textList
        self.locationId = locationId
        self.location = location 
        self.wordId  = wordId  
        self.word = word
        self.lastExecution = lastExecution   

class LocationsRepository:
    dynamoTable: str
    def __init__(self) -> None:
        self.dynamoTable = 'Locations'

    def read_locations(self) -> dict:
        try:           
            response = dynamodb_client.scan(TableName=self.dynamoTable)
            return response
        except Exception as e:   
            logger.error("error from dynamo: %s" % str(e))       
            raise 

class LastExecutionsRepository:
    dynamoTable: str


    def __init__(self) -> None:
        self.dynamoTable = 'Executions'
        self.table=  boto3.resource('dynamodb').Table( self.dynamoTable )

    def read_executions(self) -> dict:
        try:           
            response = dynamodb_client.scan(TableName=self.dynamoTable)
            return response
        except Exception as e:   
            logger.error("error from dynamo: %s" % str(e))       
            raise e
    
    def updateLastExecution(self, lastExecution: int, wordId: str, locationId: str)-> int:
        try:
            response = self.table.update_item(
                        Key={
                            'wordId': wordId,
                            'locationId': locationId
                        },
                        UpdateExpression="set lastExecution = :r",
                        ExpressionAttributeValues={
                            ':r': lastExecution,
                        },
                        ReturnValues="UPDATED_NEW"
                    )
            return lastExecution
        except Exception as e:
            logger.error("error from dynamo: %s" % str(e))       
            raise e

           
        
    
    def findLastExecution(self, lastExecutions, wordId, locationId)-> int:
        executionsItems=lastExecutions['Items']
        for execution in executionsItems:
            if(execution["wordId"]["S"]==wordId and execution["locationId"]["S"]== locationId):
                return int(execution["lastExecution"]["N"])
        return 0

class WordsRepository:
    dynamoTable: str
    def __init__(self) -> None:
        self.dynamoTable = 'Words'

    def read_words(self) -> dict:
        try:
            response = dynamodb_client.scan(TableName=self.dynamoTable)
       
            return response
        except Exception as e:   
            logger.error("error from dynamo: %s" % str(e))       
            raise e

class S3TwitterRepository:
    
    def __init__(self) -> None:
        self.fileBase = '{location}/{word}/{timestamp}/{index}.txt'
        self.bucket = os.environ.get('BUCKET')

    def upload_tweets(self, twitterResponse: TwitterResponse):
        try:
            
            for idx, line  in enumerate(twitterResponse.textList):
                file = self.fileBase.format(location = twitterResponse.location,
                                          word=twitterResponse.word,
                                          timestamp=twitterResponse.lastExecution,
                                          index=idx)
           
            
                object = s3.Object(
                    bucket_name=self.bucket, 
                    key=file
                )
                object.put(Body=line)
            
        except Exception as e:   
            logger.error("error from dynamo: %s" % str(e))       
            raise e

class TwitterService:
    urlBase: str
    authorizationHeader: str
    http: urllib3.PoolManager
    locationsRepository: LocationsRepository
    wordsRepository:  WordsRepository
    lastExecutionsRepository:  LastExecutionsRepository
    s3TwitterRepository: S3TwitterRepository

    def __init__(self) -> None:
        self.urlBase = 'https://api.twitter.com/1.1/search/tweets.json?since_id={}&q={}&result_type=recent&geocode={},{},{}&include_entities=true&include_ext_edit_contro=true&count=100&tweet_mode=extended'
        self.authorizationHeader = 'Bearer AAAAAAAAAAAAAAAAAAAAAASYnAEAAAAALMg1qPFnngcxuZG4og6VTvT2k4k%3DhGwPjI0AvjTiktl6FeMyETPpKcXP5UBdvSGVtjrd7D7NR6ThNd'
        self.http = urllib3.PoolManager()
        self.locationsRepository = LocationsRepository()
        self.wordsRepository =  WordsRepository()
        self.lastExecutionsRepository = LastExecutionsRepository()
        self.s3TwitterRepository = S3TwitterRepository()

    def create_request(self) -> list:
        try:
            ret = []
            locations = self.locationsRepository.read_locations()
            words = self.wordsRepository.read_words()
            lastExecutions = self.lastExecutionsRepository.read_executions()
            locationItems = locations['Items']
            for location in locationItems:
                 longitud = location['longitud']['S']
                 latitud = location['latitud']['S']
                 distancia = location['distancia']['S']
                 lugar = location['name']['S']
                 locationId = location['id']['S']
                 wordsItems = words['Items']
                 for word in wordsItems:
                        wordStr = word['word']['S']
                        wordStr = urllib.parse.quote(wordStr)

                        queryId = word['id']['S']
                        lastExecution = self.lastExecutionsRepository.findLastExecution(locationId=locationId,wordId=queryId,lastExecutions=lastExecutions)
                        ret.append(TwitterRequest(query=wordStr, queryId=queryId,longitude=longitud,latitude=latitud,distance=distancia,location=lugar, locationId =locationId, lastExecution=lastExecution))
                        
            
            return ret
        except Exception as e: 
            logger.error("error from repository: %s" % str(e))          
            raise e   

    def read_tweets(self, twitterRequest: TwitterRequest) -> TwitterResponse:
        try:
            ret = []
            strRequest = self.urlBase.format(twitterRequest.lastExecution,twitterRequest.query,twitterRequest.latitude, twitterRequest.longitude, twitterRequest.distance)
            resp = self.http.request('GET',strRequest, headers={'authorization': self.authorizationHeader})
            logger.debug("twitter response: %s" % str(resp.data))           
            tweets_object = json.loads(resp.data)
            for tweet in tweets_object["statuses"]:
                    ret.append(tweet["full_text"])
            lastExecution=tweets_object["search_metadata"]["max_id"]
            twitterResponse=TwitterResponse(textList=ret, 
                                                  wordId=twitterRequest.queryId,
                                                  word= twitterRequest.query,
                                                  locationId=twitterRequest.locationId, 
                                                  location=twitterRequest.location,
                                                  lastExecution=lastExecution)
            return twitterResponse
        except Exception as e: 
            logger.error("error from twitter: %s" % str(e))          
            raise e

    def update_response(self, twitterResponse: TwitterResponse) -> TwitterResponse:
        try:
            self.lastExecutionsRepository.updateLastExecution(lastExecution=twitterResponse.lastExecution,
                                                              locationId=twitterResponse.locationId,
                                                              wordId=twitterResponse.wordId
                                                              )
            if len(twitterResponse.textList) > 0:
                self.s3TwitterRepository.upload_tweets(twitterResponse)
        except Exception as e: 
            logger.error("error from repository: %s" % str(e))          
            raise e         



service = TwitterService()



def handler(event, context):
    try:
        logger.debug("Service request: %s" % str(event))
       
        requests = service.create_request()
        for request in requests:
            twitts = service.read_tweets(request)
            service.update_response(twitts)
            
            logger.debug(str(twitts))
        
        
        return {
            
        }

    except Exception as e:
        logger.error(e)
        raise e

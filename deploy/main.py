from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from deta import Deta

deta = Deta()

notes = deta.Base("hs-notes-dev")
confs = deta.Base("hs-envs-dev")
history = deta.Base("hs-history-dev")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Note(BaseModel):
    created_on: str
    author_name: str
    author_image: str
    message: str
    label: str

class EnvItem(BaseModel):
    name: str
    environmentIndex: int
    variables: list

class Env(BaseModel):
    updated_on: str
    author: int
    author_name: str
    author_image: str
    environment: List[EnvItem]

class ColItem(BaseModel):
    name: str
    folders: list
    requests: list

class Collection(BaseModel):
    updated_on: str
    author: int
    author_name: str
    author_image: str
    collection: List[ColItem]



class HistoryItem(BaseModel):
    key: str = None
    name: str
    status: int
    date: str
    time: str
    method: str
    url: str
    path: str
    usesPreScripts: bool
    preRequestScript: str
    duration: int
    star: bool
    auth: str
    httpUser: str
    httpPassword: str
    bearerToken: str
    headers: List[dict]
    params: List[dict]
    bodyParams: List[dict]
    rawParams: str
    rawInput: bool
    contentType: str
    requestType: str
    testScript: str
    usesPostScripts: bool

@app.post("/api/notes")
def save_note(n: Note):
    notes.put(n.dict())
    return n.dict()

@app.get("/api/notes")
def list_notes():
    return next(notes.fetch())

@app.delete("/api/notes")
def delete_note(key: str ):
    return notes.delete(key)

@app.post("/api/envs")
def save_envs(e: Env):
    ee = e.dict()
    ee["key"] = "envs-config"
    return confs.put(ee)

@app.get("/api/envs")
def list_envs():
    return confs.get("envs-config")


@app.post("/api/collections")
def save_collections(c: Collection):
    cc = c.dict()
    cc["key"] = "collections-config"
    return confs.put(cc)


@app.get("/api/collections")
def list_collections():
    return confs.get("collections-config")


@app.post("/api/history")
def save_history(h: HistoryItem):
    hh = h.dict()
    if hh["key"] == None:
        del hh["key"]
    return history.put(hh)


@app.get("/api/history")
def list_history():
    return next(history.fetch(pages=1, buffer=1000))


@app.delete("/api/history")
def delete_history(key: str):
    return history.delete(key)



@app.delete("/api/history/all")
def clear_history():
    for ii in history.fetch():
        for i in ii:
            history.delete(i["key"])


app.mount("/", StaticFiles(directory=".", html="true"), name="static")

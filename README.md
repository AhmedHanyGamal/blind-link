<div align="center">
  
  # Blind Link
  #### Linking people together while being completely blind
  
</div>

## Table of Contents

1. [What is Blind Link?](#what-is-blind-link)
2. [How the algorithm works](#how-does-the-algorithm-work)
3. [Pros and Cons](#what-are-the-pros-and-cons-of-this-algorithm)
4. [Is it worth it?](#is-it-worth-it)
5. [Why I did this project](#why-i-did-this-project)
6. [How to run it](#how-to-run-it)
7. [How to deploy it](#how-to-deploy-it)
8. [Special thanks](#special-thanks)
9. [Contributions](#contributions)



## What is Blind Link?
Blind Link is a web-based messaging platform, but unlike most messaging platforms that use end-to-end encryption or other similar methods to guarantee your privacy, Blind Link uses a different algorithm made by us. <br>
end-to-end encryption is great, no one can know what you're sending other than the person receiving your message, **BUT**, the messaging app/server does know who you are sending your message to. <br>
If some entity had full cooperation from both the messaging app and your ISP (internet service provider), they would easily know who you sent your message to, they still wouldn't know what you sent though. <br>
Blind Link however uses an algorithm that doesn't just hide the contents of the message, it also hides the recipient of the message. Meaning that even if some entity were to have full cooperation from the server and the ISP, it still wouldn't be able to know who you sent the message to. 

## How does the algorithm work?
This is going to be a very technical portion in this readme file, so if you don't know how public key cryptography works (mainly asymmetric encryption and digital signatures), you need to go do some research on the topic for this section to make sense, or you can just skip it. 
<br>
<br>
### Explanation
The system is divided into 2 parts, the backend and the frontend <br>
The backend is very minimal and only has 2 APIs:
1. To receive messages from users and save those messages in the backend server's database
2. To send all of the messages in the database starting from a certain index to the person who sent the request

The frontend is the part with all the work <br>
The algorithm uses RSA for encryption and ECDSA for digital signatures. <br>
Each user in the system has 2 key pairs, one of them being an encryption/decryption key pair, and the other being a signature/verification key pair. <br>
For 2 users to send messages to each other, each of them must have the other user's public keys. <br>
For one of them to send a message to the other, he would need to sign the message with his signature private key, then encrypt both the message and its signature with the other person's encryption public key, then send it to the server where the encrypted data will be saved in the database. <br>
The other user will then receive all the messages that he hadn't already received, and try to decrypt every one of them, if successful, he will then check the signature and try to verify it using all the verification public keys that he has (from all his friends/contacts) until the correct one verifies the signature, proving that the message was in fact sent by the previously mentioned person. <br>

### Example
**person A** and **person B** want to text each other, but they don't want there to be a chance that anyone in this world would ever know that they are texting. <br>
So, person A and person B meet up and exchange public keys to become friends/contacts on Blind Link. <br>
Now that they are friends/contacts on Blind Link, what happens when person A sends a message to person B? <br>
person A's signature private key is used to sign the message that is to be sent, the message and the signature are then encrypted by person B's encryption public key, the encrypted data is then posted/sent to the backend, where it will be saved in the backend server's database. <br>
person B will then check if there are any new messages sent for him, so, all the messages that he hadn't yet checked should now be on his device (temporarily), he will then try to decrypt all of the messages that he received, and only the messages that were intended for him will be successfully decrypted, in our case only person A sent him a message, so we will continue this example on that one message. Each verification public key saved by person B will then be used to attempt to verify the signature associated with that message. The verification public key that verifies the signature successfully proves that person A is in fact the person who sent that message. <br>


## What are the pros and cons of this algorithm?

### pros
It hides the intended recipient of the message, which is something that most messaging platforms don't do

### cons
It has **a lot** of cons

1. It is immensely computationally expensive, as it requires the user to try to decrypt all of the messages in the system (but this isn't absolutely terrible, since the user is the one doing the computation, not the server)
2. It requires illogical amounts of internet usage, as the user doesn't just receive the messages that are sent to him, but also every other message in the system
3. The user has no way of knowing if someone sent him a message until he checks for new messages, meaning that there is no way to notify the user that he received new messages, he has to manually check for them
4. As a result of con 1 and 2 (more 2 than 1), the scalability of this project is absolutely terrible
5. The main benefit of this algorithm is that it hides the intended recipient of your messages, but for that to happen, the system has to have a good amount of people to actually work, because if the system is used by only a few people, an entity with full cooperation from the server and the ISP can still see who the people using the system are, and if the people in the system are few, it would be possible to connect the dots and find out who you're talking to
6. It will be difficult for the system to support messages in formats other than text, as any type of call will be literally impossible with this algorithm, voice messages, images, and videos would take a lot of storage (which would make problem 2 much worse than it already is)

## Is it worth it?

### Long answer
If you really want to keep the person you're talking to a secret, and the number of people in the system is just right, not too many that the system crashes, not too few that it's easy to guess who you're talking to, then the answer is **maybe**. <br>
As it will work (unless a lot of new people start using it), but it won't be that good from a user experience point of view, and there are other messaging platforms that are also incredibly secure and private, but without any of the drawbacks of this system.

### Short answer
NO.

## Why I did this project
Currently I am still a college student, so, I wanted to create a project from scratch that would both deepen my understanding and require a good level of experience in cryptography, while not being a typical end-to-end encryption based messaging app. Don't get me wrong end-to-end encryption is great, but I just feel like everyone knows it and a lot of people have already implemented it and published it on GitHub. <br>
It also sounded like a really fun project to implement :^)


## How to run it


## How to deploy it


## Special thanks
A huge thanks to my dear friend [Michael Youssry](https://github.com/Black-Hack) for telling me about his original idea and giving me permission to implement it. The core concept behind the secure messaging algorithm was entirely his, providing the first step for the project.

While Michael came up with the overall structure and functionality of the algorithm, I worked on refining it and solving some of the remaining challenges, particularly figuring out how users would establish their initial connection. I then took on the task of fully implementing the algorithm to bring it to life.


## Contributions
This project is open to contribution

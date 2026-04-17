# https://zodiackillerciphers.com/cipher-explorer/
# z340 untransposed
cipher = "H+M8|CV@KEB+*5k.LdR(UVFFz9<>#Z3P>L(MpOGp+2|G+l%WO&D#2b^D(+4(5J+VW)+kp+fZPYLR/8KjRk.#K_Rq#2|<z29^%OF1*HSMF;+BLKJp+l2_cTfBpzOUNyG)y7t-cYA2N:^j*Xz6dpclddG+4-RR+4Ef|pz/JNb>M)+l5||.VqL+Ut*5cUGR)VE5FVZ2cW+|TB45|TC^D4ct-c+zJYM(+y.LW+B.;+B31cOp+8lXz6Ppb&RG+BCOTBzF1K<SMF6N*(+HK29^:OFTO<Sf4pl/Ucy59^W(+l#2C.B)7<FBy-dkF|W<7t_BOYB*-CM>cHD8OZzSkpNA|K;+"
alphabet = ""
for letter in cipher:
    if letter not in alphabet:
        alphabet += letter

print(alphabet) # prints our cipher alphabet
# H+M8|CV@KEB*5k.LdR(UFz9<>#Z3PpOG2l%W&Db^4J)fY/j_q1S;cTNy7t-A:X6

z340_key = {
    "A": ["*","K","O","l","z"],
    "B": ["_", "f"],
    "C": ["p"],
    "D": ["6","A","S"],
    "E": ["4","B","N","b","c","|"],
    "F": ["F"],
    "G": ["L"],
    "H": ["+"],
    "I": ["<","H","P","k","y"],
    "J": [],
    "K": [],
    "L": ["7","d","t"],
    "M": ["2"],
    "N": [".","9",">","D","Y"],
    "O": ["M","R","V","^"],
    "P": ["8","j"],
    "Q": [],
    "R": ["1","E","T","X","Z"],
    "S": ["&","-","J","U"],
    "T": ["#","%","(",":",";","G"],
    "U": ["/","@","q"],
    "V": ["5"],
    "W": [")","W"],
    "X": [],
    "Y": ["3","C"],
    "Z": [],
}
# get untransposed thing and solve it using the dict
# upon investigation there seems to be no rule for which
# letter changes to which of its multiple symbols
# does dave o get into that?
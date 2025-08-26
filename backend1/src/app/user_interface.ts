export interface CreateCredentialsTokenType{
 email: String,
 password: String,
 name: String,
 role: 'buyer' | 'seller',
}

export interface VerifyCredentialsTokenType{
 email: String,
 password: String,
}
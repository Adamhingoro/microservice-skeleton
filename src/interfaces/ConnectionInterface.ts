export interface IConnection extends IConnectivity, IVerifier{
    AvailibleScope() : Promise<ConnectionScopes[]>,
    TestConnection() : Promise<boolean>,
}

export interface IConnectivity{
    SetConnectionInfo(connection: any) : void,
    GetConnectionStatus() : Promise<boolean>,
    Reconnect() : Promise<boolean>,
    Connect() : Promise<boolean>,
    Disconnect() : boolean,
}

export interface IVerifier{
    IsWordPressInstance() : Promise<boolean>,
    IsWpCliAvailible() : Promise<boolean>,
    IsGrepAvailible() : Promise<boolean>,
    IsDirectoryWriteable() : Promise<boolean>,
    IsDatabaseAccessable() : Promise<boolean>,
    IsCurlAvailible() : Promise<boolean>,
    IsZipAvailible() : Promise<boolean>,
    IsBZipAvailible() : Promise<boolean>,
    IsTarAvailible() : Promise<boolean>,
    IsMysqlDumpAvailible() : Promise<boolean>,
    IsSpaceAvailible() : Promise<boolean>,
    IsPHPClivailible() : Promise<boolean>,
    IsNCAvailible() : Promise<boolean>,
}

export interface IBackupable{
    CreateBackup(): Promise<boolean>,
    RestoreBackup(): Promise<boolean>,
}

export enum ConnectionScopes {
    WORDPRESS_INSTANCE = "WORDPRESS_INSTANCE",
    WPCLI_AVAILIBLE = "WPCLI_AVAILIBLE",
    GREP_AVAILIBLE = "GREP_AVAILIBLE",
    DIRECTORY_WRITEABLE = "DIRECTORY_WRITEABLE",
    DATABASE_ACCESSABLE = "DATABASE_ACCESSABLE",
    CURL_AVAILIBLE = "CURL_AVAILIBLE",
    ZIP_AVAILIBLE = "ZIP_AVAILIBLE",
    BZIP_AVAILIBLE = "BZIP_AVAILIBLE",
    TAR_AVAILIBLE = "TAR_AVAILIBLE",
    MYSQLDUMP_AVAILIBLE = "MYSQLDUMP_AVAILIBLE",
    DISKSPACE_AVAILIBLE = "DISKSPACE_AVAILIBLE",
    PHPCLI_AVAILIBLE = "PHPCLI_AVAILIBLE",
    NC_AVAILIBLE = "NC_AVAILIBLE",
}

export interface WordPress {
    PublicURL : string,
    Version : string,
    CurrentTheme : string,
    Plugins : string[],
    Themes : string[],
    Users : string[],
    IsMultisite : boolean,
    PHPVersion: string,
    database: {
        hostname : string,
        username : string,
        password : string,
        database : string,
    }
}
import { plural } from "pluralize";
import { camelCase } from "camel-case";
import { flatten } from "lodash";
import { Entity, Module } from "@amplication/code-gen-types";
import { validateEntityName } from "../../utils/entity";
import {
  createServiceBaseId,
  createServiceId,
  createServiceModules,
} from "./service/create-service";
import { createControllerModules } from "./controller/create-controller";
import { createModules } from "./module/create-module";
import { createEntityControllerSpec } from "./test/create-controller-spec";
import { createResolverModules } from "./resolver/create-resolver";
import { builders } from "ast-types";
import DsgContext from "../../dsg-context";
import { createLog } from "../../create-log";
import { ILogger } from "@amplication/util/logging";

export async function createResourcesModules(
  entities: Entity[],
  logger: ILogger
): Promise<Module[]> {
  const resourceModuleLists = await Promise.all(
    entities.map((entity) => createResourceModules(entity, logger))
  );
  const resourcesModules = flatten(resourceModuleLists);
  return resourcesModules;
}

async function createResourceModules(
  entity: Entity,
  logger: ILogger
): Promise<Module[]> {
  const entityType = entity.name;
  const { appInfo } = DsgContext.getInstance;

  validateEntityName(entity);

  await createLog({ level: "info", message: `Creating ${entityType}...` });
  const entityName = camelCase(entityType);
  const resource = camelCase(plural(entityName));
  const serviceId = createServiceId(entityType);
  const serviceBaseId = createServiceBaseId(entityType);
  const delegateId = builders.identifier(entityName);

  const serviceModules = await createServiceModules(
    entityName,
    entityType,
    entity,
    serviceId,
    serviceBaseId,
    delegateId
  );

  const [serviceModule] = serviceModules;

  const controllerModules =
    (appInfo.settings.serverSettings.generateRestApi &&
      (await createControllerModules(
        resource,
        entityName,
        entityType,
        serviceModule.path,
        entity
      ))) ||
    [];

  const [controllerModule, controllerBaseModule] = controllerModules;

  const resolverModules =
    (appInfo.settings.serverSettings.generateGraphQL &&
      (await createResolverModules(
        entityName,
        entityType,
        serviceModule.path,
        entity
      ))) ||
    [];
  const [resolverModule] = resolverModules;

  const resourceModules = await createModules(
    entityName,
    entityType,
    serviceModule.path,
    controllerModule?.path,
    resolverModule?.path
  );

  const testModule =
    (controllerModule &&
      (await createEntityControllerSpec(
        resource,
        entity,
        entityType,
        serviceModule.path,
        controllerModule.path,
        controllerBaseModule.path
      ))) ||
    [];

  return [
    ...serviceModules,
    ...controllerModules,
    ...resolverModules,
    ...resourceModules,
    ...testModule,
  ];
}
